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

  const isOpen = horarioStatus.isOpen;
  const isLunchBreak = horarioStatus.emIntervalo;

  const lockColor = isOpen ? colors.botao : isLunchBreak ? colors.destaque : '#F44336';

  const fazEntrega = item.fazEntrega === true;
  const temDomingo = item.horarios?.domingo &&
    item.horarios.domingo.abre &&
    item.horarios.domingo.fecha;

  const temIntervalo = item.horarios?.intervalo?.global === true;

const abrirNoMaps = () => {
  if (!item.coordenadas || !item.nome) return;

  const [lat, lng] = item.coordenadas.split(',').map(s => s.trim());
  const nomeLoja = encodeURIComponent(item.nome.trim());
  const endereco = item.enderecoCompleto?.formato 
    ? encodeURIComponent(item.enderecoCompleto.formato.trim())
    : '';

  // Melhor formato: abre com nome da loja e endereço no marcador
  const label = endereco ? `${nomeLoja} - ${endereco}` : nomeLoja;
  const encodedLabel = encodeURIComponent(label);

  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodedLabel}`;

  Linking.openURL(url).catch(() => {
    // Fallback seguro
    Linking.openURL(`https://www.google.com/maps/@${lat},${lng},18z`);
  });
};

  return (
    <BottomSheetView style={styles.container}>
      <View style={styles.header}>
        {/* Nome centralizado */}
        <Text style={[styles.storenome, { color: colors.text }]}>{item?.nome}</Text>

        {item?.descricao && (
          <Text style={[styles.descricao, { color: colors.text + 'CC' }]}>
            {item?.descricao}
          </Text>
        )}

        {/* Bloco de informações centralizadas */}
        <View style={styles.infoBlock}>
          {/* Status aberto/fechado */}
          <View style={styles.infoRow}>
            <Ionicons name={isOpen ? 'lock-open-outline' : 'lock-closed-outline'} size={18} color={lockColor} />
            <Text style={styles.infoText}>{horarioStatus.text}</Text>
          </View>

          {/* Aberto aos domingos */}
          {temDomingo && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color={colors.text + '90'} />
              <Text style={styles.infoText}>Aberto aos domingos</Text>
            </View>
          )}

          {/* Intervalo de almoço */}
          {temIntervalo && (
            <View style={styles.infoRow}>
              <Ionicons name="hourglass-outline" size={16} color={colors.text + '90'} />
              <Text style={styles.infoText}>
                {isLunchBreak
                  ? `Voltamos às ${item.horarios.intervalo.retorno}`
                  : `Intervalo: ${item.horarios.intervalo.inicio} – ${item.horarios.intervalo.retorno}`}
              </Text>
            </View>
          )}

          {/* Sem intervalo */}
          {item.horarios?.intervalo?.global === false && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color={colors.text + '90'} />
              <Text style={styles.infoText}>Não fechamos para almoço</Text>
            </View>
          )}

          {/* Faz entregas */}
          {fazEntrega && (
            <View style={styles.infoRow}>
              <Ionicons name="bicycle-outline" size={16} color={colors.text + '90'} />
              <Text style={styles.infoText}>Fazemos entregas</Text>
            </View>
          )}
        </View>
      </View>

      {/* Espaço antes do endereço */}
      <View style={styles.addressSpacer} />

      {/* Endereço clicável */}
      {item.enderecoCompleto && item.coordenadas && (
        <Pressable onPress={abrirNoMaps} style={styles.addressContainer}>
          <Ionicons name="location-outline" size={20} color={colors.primary || '#1A73E8'} />
          <Text style={styles.endereco}>
            {item.enderecoCompleto.formato}
          </Text>
        </Pressable>
      )}

      {/* Botão WhatsApp */}
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
    textAlign: 'center',
  },
  descricao: {
    fontSize: 16.8,
    marginTop: 12,
    textAlign: 'center',
  },
  infoBlock: {
    alignItems: 'center',
    gap: 6,
    marginTop: 35,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 15,
    color: '#666',
  },
  addressSpacer: {
    height: 16,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 22,
    backgroundColor: '#00000006',
    marginBottom: 22,
    gap: 10,
  },
  endereco: {
    fontSize: 15,
    textAlign: 'center',
    color: '#666',
    flex: 1,
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