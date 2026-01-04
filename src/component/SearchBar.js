import React, { useRef } from 'react';
import { View, TextInput, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
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

  const mostrarLupa = !buscaExecutada;
  const iconeNome = mostrarLupa ? 'search' : 'close';

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
        <Pressable style={styles.button} onPress={mostrarLupa ? onExecutarBusca : onLimparBusca}>
          {carregando && buscaExecutada ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Ionicons name={iconeNome} size={24} color={colors.text} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 16, paddingTop: 12, paddingHorizontal: 22 },
  shadow: { elevation: 3, borderBottomLeftRadius: 22, borderBottomRightRadius: 22 },
  bar: { borderRadius: 35, height: 50, flexDirection: 'row', alignItems: 'center', paddingLeft: 22 },
  input: { flex: 1, fontSize: 16, height: 50 },
  button: { width: 45, height: 45, margin: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 30 },
});