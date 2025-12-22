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

  // === COR INTELIGENTE DO NOME (agora 100% correta) ===
  const nomeCor =
    // Durante busca → destaca só quem tem busca: true
    (searchQuery?.trim() && isBusca)
      ? colors.destaque
      // Sem busca → destaca só premium
      : (!searchQuery?.trim() && isPremium)
        ? colors.destaque
        : colors.primary;

  // === STATUS DE HORÁRIO (agora entende português) ===
  const horarioStatus = getHorarioStatus(item.horarios);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(item)}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Nome da loja */}
        <Text style={[styles.nome, { color: nomeCor }]} numberOfLines={1}>
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
            {/* Anúncio pago — aparece se for premium OU busca (durante busca) */}
            {(isPremium || (isBusca && searchQuery?.trim())) && (
              <Text style={[styles.sponsored, { color: colors.text + '70' }]}>
                ・ Anúncio pago
              </Text>
            )}

            {/* Ícone de destaque (opcional) */}
            {calcularDestaque() && (
              <Ionicons name="trending-up" size={16} color={colors.primary} />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal:22
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
  left: { flex: 1 },
  categoria: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sponsored: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});