// src/component/StoreItem.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getHorarioStatus } from '../utils/carregaHorarios';
import { normalize } from '../utils/normalize';

// Lista de preposições e palavras irrelevantes para remover
const PREPOSICOES = new Set([
  'de', 'para', 'em', 'com', 'a', 'o', 'da', 'do', 'as', 'os',
  'um', 'uma', 'e', 'ou', 'no', 'na', 'dos', 'das', 'ao', 'à',
  'pelo', 'pela', 'nos', 'nas', 'por', 'até', 'sem', 'sob',
  'sobre', 'entre', 'atrás', 'frente', 'dentro', 'fora'
]);


export const Item = ({ item, index, results, onPress, colors, searchQuery, ITENS_FIXOS_NO_TOPO }) => {
  // const ITENS_FIXOS_NO_TOPO = 3;

  const calcularDestaque = () => {
    // Não mostra ícone para premium
    if (item?.anuncio?.premium) return false;

    if (!Array.isArray(results)) return false;

    // Conta quantos itens normais com cliques estão antes dele
    const itensAntes = results.slice(0, index);
    const podiumAntes = itensAntes.filter(
      i => !i?.anuncio?.premium && (i.clicks || 0) > 0
    ).length;

    // Só mostra o ícone se estiver entre os top 3 por cliques
    return (item.clicks || 0) > 0 && podiumAntes < ITENS_FIXOS_NO_TOPO;
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
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, justifyContent: "space-between" }}>
          <View>

            {calcularDestaque() && <Text style={{color:colors.destaque, fontWeight:500}}>Destaque</Text>}
            <Text style={[styles.nome, { color: nomeCor }]} numberOfLines={1}>
              {item.nome}
            </Text>
          </View>
          {calcularDestaque() && (
            <Ionicons name="ribbon-outline" size={16} color={colors.text} />
          )}

        </View>

        {item.descricao ? (
          <Text style={[styles.descricao, { color: colors.text + 'B3' }]} numberOfLines={3}>
            {item.descricao}
          </Text>
        ) : null}





        <View style={styles.footer}>

          <View style={styles.left}>

            {/* Status aberto/fechado */}
            <View style={styles.infoRow}>
              {/* <Ionicons name={horarioStatus?.isOpen ? 'lock-open-outline' : 'lock-closed-outline'} size={11} color={horarioStatus?.isOpen ? 'green':'red'} /> */}
              <Text style={[styles.infoText, { color: colors.suave }]}>{horarioStatus.text} - {item?.bairro}</Text>
            </View>


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
  nome: {
    fontSize: 18,
    fontWeight: '600',
  },
  descricao: {
    fontSize: 15,
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: "flex-end",
    justifyContent: 'space-between',
    marginTop: 4,
  },
  left: { flex: 1 },
  infoRow: {
    flexDirection: "row",
    alignItems: 'center',
    gap: 6
  },
  categoria: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
  },
  infoText: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
  },
  buscaInfoContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  buscaEncontrada: {
    fontSize: 12,
    color: '#000',
    fontWeight: 300
  },
  buscaNaoEncontrada: {
    fontWeight: 300,
    color: '#000',
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