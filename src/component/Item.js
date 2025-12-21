// src/component/StoreItem.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getHorarioStatus } from '../utils/horarioUtils';

const NUMERO_ITENS_FIXOS_POR_CLIQUES = 3;

export const Item = ({ item, index, results, onPress, colors, searchQuery }) => {

  // PROTEÇÃO TOTAL CONTRA O ERRO "slice of undefined"
  const calcularDestaque = () => {
    if (item?.anuncio?.premium) return false;
    if (!Array.isArray(results)) return false;

    const premiumBefore = results
      .slice(0, index)
      .filter(i => i && i?.anuncio?.premium === true).length;

    const posicao = index - premiumBefore;
    return posicao < NUMERO_ITENS_FIXOS_POR_CLIQUES;
  };

  const isPremium = item?.anuncio?.premium === true;
  const isBusca = item?.anuncio?.busca === true;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(item)}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Nome da loja */}
        {/* COR INTELIGENTE: muda conforme o contexto */}
        <Text
          style={[
            styles.nome,
            {
              color:
                // Durante busca → só destaca se tiver busca: true
                (searchQuery?.trim() && item?.anuncio?.busca)
                  ? colors.notification
                  // Sem busca → só destaca se tiver premium: true
                  : (!searchQuery?.trim() && item?.anuncio?.premium)
                    ? colors.notification
                    : colors.black
            }
          ]}
          numberOfLines={1}
        >
          {item.nome}
        </Text>

        {/* Descrição */}
        {item.descricao ? (
          <Text style={[styles.descricao, { color: colors.text + 'B3' }]} numberOfLines={3}>
            {item.descricao}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.left}>
            {item.categoria && (
              <Text style={[styles.categoria, { color: colors.suave }]}>
                {item.categoria} - {item.endereco?.bairro}
              </Text>
            )}
          </View>

          <View style={styles.right}>
            {/* Patrocinado (muito discreto) */}
            {isPremium && (
              <Text style={[styles.sponsored, { color: colors.text + '70' }]}>
                ・ Anúncio pago
              </Text>
            )}
            {isBusca && !!searchQuery && (
              <Text style={[styles.sponsored, { color: colors.text + '70' }]}>
                ・ Anúncio pago
              </Text>
            )}

            
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ESTILOS 100% ORIGINAIS — NADA MUDOU
const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  content: {},
  nome: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 28,
  },
  descricao: {
    fontSize: 15,
    opacity: 0.88,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  left: {
    flex: 1,
  },
  categoria: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sponsored: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});