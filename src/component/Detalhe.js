// src/component/StoreBottomSheet.js
import React from 'react';
import { Text, Pressable, Linking, View, StyleSheet } from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { getHorarioStatus } from '../utils/horarioUtils';
import { Ionicons } from '@expo/vector-icons';
import { incrementClicks } from '../services/firebaseConnection/firestoreService';

export const Detalhe = ({ item, colors, onClose }) => {
  const horarioStatus = getHorarioStatus(item.horarios);
  const temIntervalo = item.horarios?.intervalo?.global === true;

  const handleWhatsApp = async () => {
    if (!item.premium) await incrementClicks(item.id);
    Linking.openURL(`https://wa.me/${item?.whatsapp?.principal.replace(/\D/g, '')}`);
  };

  return (
    <BottomSheetView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.storenome, { color: colors.text }]}>{item.nome}</Text>

        {item.descricao && (
          <Text style={[styles.descricao, { color: colors.text + 'CC' }]}>
            {item.descricao}
          </Text>
        )}

        {horarioStatus && (
          <View style={styles.statusBadge}>
            <View style={[
              styles.statusDot,
              {
                backgroundColor:
                  horarioStatus.isOpen ? '#34A853' :
                    horarioStatus.emIntervalo ? '#FF9800' : '#F44336'
              }
            ]} />
            <Text style={[
              styles.statusText,
              {
                color:
                  horarioStatus.isOpen ? '#34A853' :
                    horarioStatus.emIntervalo ? '#FF9800' : '#F44336'
              }
            ]}>
              {horarioStatus.text}
            </Text>
          </View>
        )}

        {/* MENSAGEM DE INTERVALO — só aparece se tiver intervalo configurado */}
        {temIntervalo && (
          <Text style={[styles.intervaloInfo, { color: colors.suave }]}>
            {horarioStatus.emIntervalo
              ? `Voltamos às ${item.horarios.intervalo.retorno}`
              : horarioStatus.isOpen
                ? `Intervalo de ${item.horarios.intervalo.inicio} às ${item.horarios.intervalo.retorno}`
                : null
            }
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

      <Pressable onPress={handleWhatsApp} style={styles.whatsappButton}>
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
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  intervaloInfo: {
    marginTop: 6,
    fontSize: 16,
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
    backgroundColor: '#25D366',
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