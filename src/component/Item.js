// src/component/StoreItem.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getHorarioStatus } from '../utils/horarioUtils';
import { normalize } from '../utils/normalize';

// Lista de preposições e palavras irrelevantes para remover
const PREPOSICOES = new Set([
  'de', 'para', 'em', 'com', 'a', 'o', 'da', 'do', 'as', 'os',
  'um', 'uma', 'e', 'ou', 'no', 'na', 'dos', 'das', 'ao', 'à',
  'pelo', 'pela', 'nos', 'nas', 'por', 'até', 'sem', 'sob',
  'sobre', 'entre', 'atrás', 'frente', 'dentro', 'fora'
]);

const NUMERO_ITENS_FIXOS_POR_CLIQUES = 3;

export const Item = ({ item, index, results, onPress, colors, searchQuery }) => {
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

  const nomeCor =
    (searchQuery?.trim() && isBusca)
      ? colors.destaque
      : (!searchQuery?.trim() && isPremium)
        ? colors.destaque
        : colors.primary;

  const horarioStatus = getHorarioStatus(item.horarios);

  // === TAGS RELEVANTES + PALAVRAS NÃO ENCONTRADAS (sem preposições) ===
  const buscaInfo = React.useMemo(() => {
    if (!searchQuery?.trim() || !Array.isArray(item.tags) || item.tags.length === 0) {
      return null;
    }

    // Filtra preposições da busca
    const palavrasBusca = normalize(searchQuery)
      .split(/\s+/)
      .filter(Boolean)
      .filter(palavra => !PREPOSICOES.has(palavra.toLowerCase()));

    if (palavrasBusca.length === 0) return null;

    const tagsNormalizadas = item.tags.map(tag => normalize(tag.trim()));

    const encontradas = [];
    const naoEncontradas = [];

    palavrasBusca.forEach(palavra => {
      const encontrou = tagsNormalizadas.some(tag => tag.includes(palavra));
      if (encontrou) {
        encontradas.push(palavra);
      } else {
        naoEncontradas.push(palavra);
      }
    });

    if (encontradas.length === 0 && naoEncontradas.length === 0) return null;

    return { encontradas, naoEncontradas };
  }, [item.tags, searchQuery]);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(item)}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={[styles.nome, { color: nomeCor }]} numberOfLines={1}>
          {item.nome}
        </Text>

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

            {/* Tags relevantes + palavras não encontradas (sem preposições) */}
            {buscaInfo && (
              <View style={styles.buscaInfoContainer}>
                {buscaInfo.encontradas.length > 0 && (
                  <Text style={styles.buscaEncontrada}>
                    {buscaInfo.encontradas.join(' · ')}
                  </Text>
                )}
                {buscaInfo.naoEncontradas.length > 0 && (
                  <Text style={styles.buscaNaoEncontrada}>
                    {buscaInfo.naoEncontradas.join(' · ')}
                  </Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.right}>
            {(isPremium || (isBusca && searchQuery?.trim())) && (
              <Text style={[styles.sponsored, { color: colors.text + '70' }]}>
                ・ Anúncio pago
              </Text>
            )}

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
    paddingVertical: 16,
    paddingHorizontal: 22,
  },
  content: {},
  nome: {
    fontSize: 18,
    fontWeight: '600',
  },
  descricao: {
    fontSize: 15,
    marginTop:-2
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  left: { flex: 1 },
  categoria: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
  },
  buscaInfoContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems:'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  buscaEncontrada: {
    fontSize: 12,
    color:'#000',
    fontWeight:300
  },
  buscaNaoEncontrada: {
    fontWeight:300,
    color:'#000',
    fontSize: 12,
    textDecorationLine: 'line-through',
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