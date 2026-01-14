// src/components/StoreItem.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getHorarioStatus } from '../utils/carregaHorarios';

export const Item = ({ 
  item, 
  onPress, 
  colors, 
  searchQuery,
  // Nova prop: só mostra destaque na home
  isHome = false  // true quando não há busca ativa
}) => {

  // Agora usamos a flag que veio do backend da ordenação
  const isDestaque = isHome && item._isDestaque === true;

  const isPremium = item?.anuncio?.premium === true;
  const isBusca = item?.anuncio?.busca === true;

  // Cor do nome: destaque visual para anúncios pagos
  const nomeCor =
    (searchQuery?.trim() && isBusca) || (!searchQuery?.trim() && isPremium)
      ? colors.destaque
      : colors.primary;

  const horarioStatus = getHorarioStatus(item.horarios);

  const temAnuncioAtivo = isPremium || (isBusca && searchQuery?.trim());

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(item)}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            {isDestaque && (
              <Text style={{ color: colors.destaque, fontWeight: '500' }}>
                Destaque
              </Text>
            )}
            <Text style={[styles.nome, { color: nomeCor }]} numberOfLines={1}>
              {item.nome}
            </Text>
          </View>

          {isDestaque && (
            <Ionicons name="ribbon-outline" size={16} color={colors.text} />
          )}
        </View>

        {item.descricao ? (
          <Text style={[styles.descricao, { color: colors.text + 'B3' }]} numberOfLines={2}>
            {item.descricao}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.left}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoText, { color: colors.suave }]}>
                {(() => {
                  const text = horarioStatus.text;

                  if (text.startsWith('Aberto - Fecha às')) {
                    const resto = text.slice('Aberto - '.length);
                    return (
                      <>
                        <Text style={{ color: colors.botao, fontWeight: '500' }}>Aberto</Text>
                        <Text> - {resto}</Text>
                      </>
                    );
                  }

                  return text;
                })()}
              </Text>
            </View>
          </View>

          <View style={styles.right}>
            {temAnuncioAtivo && (
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

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
  content: {},
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 10,
  },
  nome: {
    fontSize: 18,
    fontWeight: '600',
  },
  descricao: {
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  left: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 11,
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