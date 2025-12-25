// src/component/StoreBottomSheet.js
import { Text, Pressable, Linking, View, StyleSheet } from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { getHorarioStatus } from '../utils/carregaHorarios';
import { Ionicons } from '@expo/vector-icons';
import { incrementClicks } from '../services/firebaseConnection/firestoreService';

export const DetalheDoItem = ({ item, colors }) => {
  const horarioStatus = getHorarioStatus(item.horarios);

  const handleWhatsApp = async () => {
    if (!item.premium) await incrementClicks(item.id);
    Linking.openURL(`https://wa.me/${item?.whatsapp?.principal.replace(/\D/g, '')}`);
  };

  // Determina qual ícone e cor usar
  const lockIconName = horarioStatus.isOpen ? 'lock-open-outline' : 'lock-closed-outline';
  const statusColor = horarioStatus.isOpen
    ? colors.botao
    : horarioStatus.emIntervalo
    ? colors.destaque
    : '#F44336';

  return (
    <BottomSheetView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.storenome, { color: colors.text }]}>{item?.nome}</Text>

        {item?.descricao && (
          <Text style={[styles.descricao, { color: colors.text + 'CC' }]}>
            {item?.descricao}
          </Text>
        )}

        {horarioStatus && (
          <View style={styles.statusBadge}>
            <Ionicons name={lockIconName} size={18} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {horarioStatus.text}
            </Text>
          </View>
        )}

        {/* MENSAGEM DE INTERVALO — só aparece se tiver configuração de intervalo */}
        {item.horarios?.intervalo && (
          <Text style={[styles.intervaloInfo, { color: colors.primary }]}>
            {item.horarios.intervalo.global === false ? (
              'Não fechamos para almoço'
            ) : horarioStatus.emIntervalo ? (
              `Voltamos às ${item.horarios.intervalo.retorno} hs`
            ) : horarioStatus.isOpen ? (
              `Intervalo de ${item.horarios.intervalo.inicio} hs às ${item.horarios.intervalo.retorno} hs`
            ) : null}
          </Text>
        )}
      </View>

      {item.endereco?.complemento && (
        <View style={styles.addressContainer}>
          <Ionicons name="location-outline" size={19} color={colors.primary || '#1A73E8'} />
          <Text style={[styles.endereco, { color: colors.text + 'EE' }]}>
            {item.endereco?.complemento} - {item?.endereco?.bairro}
          </Text>
        </View>
      )}

      <Pressable onPress={handleWhatsApp} style={[styles.whatsappButton, { backgroundColor: colors.botao }]}>
        <Ionicons name="logo-whatsapp" size={28} color="#fff" />
        <Text style={styles.whatsappText}>WhatsApp</Text>
      </Pressable>
    </BottomSheetView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    marginTop: 20,
    marginBottom: 18,
    alignItems: 'center',
  },
  storenome: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 9,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  intervaloInfo: {
    marginTop: 6,
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  descricao: {
    fontSize: 16.8,
    marginVertical: 20,
    textAlign: 'center',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#00000006',
    marginBottom: 22,
  },
  endereco: {
    flex: 1,
    textAlign: 'center',
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 20,
    borderRadius: 22,
    marginTop: 'auto',
    elevation: 14,
  },
  whatsappText: {
    color: '#fff',
    fontSize: 18.5,
    fontWeight: '700',
  },
});