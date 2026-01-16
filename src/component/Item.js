// src/components/StoreItem.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getHorarioStatus } from '../utils/carregaHorarios';

export const Item = ({ 
  item, 
  onPress, 
  colors, 
  searchQuery,
  isDestaque = false
}) => {

  const isPremium = item?.anuncio?.premium === true;
  const isBusca = item?.anuncio?.busca === true;

  const nomeCor =
    (searchQuery?.trim() && isBusca) || (!searchQuery?.trim() && isPremium)
      ? colors.destaque
      : colors.primary;

  const temAnuncioAtivo = isPremium || (isBusca && searchQuery?.trim());

  // === CÁLCULO DO STATUS GLOBAL DA LOJA ===
  let statusGlobal = { text: 'Fechado', isOpen: false };

  if (item.filiais && Array.isArray(item.filiais) && item.filiais.length > 0) {
    // Verifica se pelo menos uma filial está aberta
    const algumaAberta = item.filiais.some(filial => {
      if (!filial.horarios) return false;
      const status = getHorarioStatus(filial.horarios);
      return status.isOpen && !status.emIntervalo; // emIntervalo conta como fechado temporariamente
    });

    if (algumaAberta) {
      // Usa o status da primeira filial aberta para o texto detalhado
      const primeiraAberta = item.filiais.find(filial => {
        if (!filial.horarios) return false;
        const status = getHorarioStatus(filial.horarios);
        return status.isOpen && !status.emIntervalo;
      });

      if (primeiraAberta) {
        statusGlobal = getHorarioStatus(primeiraAberta.horarios);
      } else {
        statusGlobal = { text: 'Aberto', isOpen: true };
      }
    }
  } else if (item.horarios) {
    // Compatibilidade com estrutura antiga (horarios no root)
    statusGlobal = getHorarioStatus(item.horarios);
  }

  const { text: horarioText } = statusGlobal;

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
              <Text style={styles.destaqueText}>
                Destaque
              </Text>
            )}

            <Text style={[styles.nome, { color: nomeCor }]} numberOfLines={1}>
              {item.nome}
            </Text>
          </View>

          <View />
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
                  if (horarioText.startsWith('Aberto - Fecha às')) {
                    const resto = horarioText.slice('Aberto - '.length);
                    return (
                      <>
                        <Text style={{ color: colors.botao, fontWeight: '500' }}>Aberto</Text>
                        <Text> - {resto}</Text>
                      </>
                    );
                  }

                  return horarioText;
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  destaqueText: {
    fontSize: 10,
    color: '#dd8b06ff',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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