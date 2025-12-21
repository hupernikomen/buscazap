// src/component/StoreItem.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getHorarioStatus } from '../utils/horarioUtils';

const NUMERO_ITENS_FIXOS_POR_CLIQUES = 3;

export const Item = ({ item, index, results, onPress, colors }) => {
  const isPremium = item.premium === true;
  const premiumBefore = results.slice(0, index).filter(i => i.premium).length;
  const positionAfterPremium = index - premiumBefore;
  const isDestaque = !isPremium && positionAfterPremium < NUMERO_ITENS_FIXOS_POR_CLIQUES;

  const horarioStatus = getHorarioStatus(item.horarios);


  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(item)}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Nome da loja */}
        <Text style={[styles.nome, { color: item.premium ? colors.notification : colors.black }]} numberOfLines={1}>
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
              <Text style={[styles.categoria, { color: colors.suave,  }]}>
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
          </View>
        </View>
      </View>

      {/* Linha separadora sutil */}
      {/* <View style={[styles.divider, { backgroundColor: colors.border || '#00000010' }]} /> */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },

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
    alignItems:'center',
    marginTop: 8
  },
  left: {
    flex: 1,
  },
  categoria: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing:.35,
  },
  right: {
    flexDirection: 'row',
    alignContent: 'center',
    // gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
  },
  sponsored: {
    fontSize: 12,
    fontStyle: 'italic',
  },

});