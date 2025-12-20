// src/component/StoreBottomSheet.js
import React from 'react';
import { Text, Pressable, Linking, View, StyleSheet } from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { getHorarioStatus } from '../utils/horarioUtils';
import { Ionicons } from '@expo/vector-icons';
import { incrementClicks } from '../services/firebaseConnection/firestoreService';

export const StoreBottomSheet = ({ item, colors, onClose }) => {
  const horarioStatus = getHorarioStatus(item.horarios);

  const handleWhatsApp = async () => {
    if (!item.premium) await incrementClicks(item.id);
    Linking.openURL(`https://wa.me/${item.whatsapp[0].replace(/\D/g, '')}`);
  };



  return (
    <BottomSheetView style={styles.container}>

      <View style={styles.header}>
        <Text style={[styles.storeName, { color: colors.text }]}>{item.name}</Text>

        {horarioStatus && (
          <View style={styles.statusBadge}>
            <View style={[
              styles.statusDot,
              { backgroundColor: horarioStatus.isOpen ? '#34A853' : '#F44336' }
            ]} />
            <Text style={[
              styles.statusText,
              { color: horarioStatus.isOpen ? '#34A853' : '#F44336' }
            ]}>
              {horarioStatus.text}
            </Text>
          </View>
        )}
      </View>

      {/* Descrição */}
      {item.description && (
        <Text style={[styles.description, { color: colors.text + 'CC' }]}>
          {item.description}
        </Text>
      )}

      {/* ENDEREÇO CLICÁVEL */}
      {item.address && (
        <View style={styles.addressContainer}>
          <Ionicons name="location-outline" size={19} color={colors.primary || '#1A73E8'} />
          <Text style={[styles.address, { color: colors.text + 'EE' }]}>
            {item.address}
          </Text>
        </View>
      )}

      {/* Botão WhatsApp */}
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00000015',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginTop: 20,
    marginBottom: 18,
  },
  storeName: {
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
    width: 11,
    height: 11,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 15.5,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  description: {
    fontSize: 16.8,
    lineHeight: 26,
    marginBottom: 20,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 16,
    backgroundColor: '#00000006',
    marginBottom: 28,
  },
  address: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    lineHeight: 22,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 14,
  },
  whatsappText: {
    color: '#fff',
    fontSize: 18.5,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});