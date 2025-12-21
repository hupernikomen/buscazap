// src/component/StoreBottomSheet.js
import React from 'react';
import { Text, Pressable, Linking, View, StyleSheet } from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { getHorarioStatus } from '../utils/horarioUtils';
import { Ionicons } from '@expo/vector-icons';
import { incrementClicks } from '../services/firebaseConnection/firestoreService';
import { useNavigation } from '@react-navigation/native';

export const Detalhe = ({ item, colors, onClose }) => {
  const horarioStatus = getHorarioStatus(item.horarios);

  const handleWhatsApp = async () => {
    if (!item.premium) await incrementClicks(item.id);
    Linking.openURL(`https://wa.me/${item?.whatsapp?.principal.replace(/\D/g, '')}`);
  };

const navigation = useNavigation()

  return (
    <BottomSheetView style={styles.container}>

      <View style={styles.header}>
        <Text style={[styles.storenome, { color: colors.text }]}>{item.nome}</Text>

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
      {item.descricao && (
        <Text style={[styles.descricao, { color: colors.text + 'CC' }]}>
          {item.descricao}
        </Text>
      )}

      {/* ENDEREÇO CLICÁVEL */}
      {item.endereco?.complemento && (
        <View style={styles.addressContainer}>
          <Ionicons name="location-outline" size={19} color={colors.primary || '#1A73E8'} />
          <Text style={[styles.endereco, { color: colors.text + 'EE' }]}>
            {item.endereco?.complemento} - {item?.endereco?.bairro}
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
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 32,
  },

  header: {
    marginTop: 20,
    marginBottom: 18,
  },
  storenome: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
    lineHeight: 34,
    alignSelf:'center'
  },
  statusBadge: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems:'center',
    marginTop: 12,
    gap: 9,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 6,
  },
  statusText: {
    fontSize:12,
    fontWeight:'500',
    textTransform:'uppercase'
  },
  descricao: {
    fontSize: 16.8,
    marginBottom: 20,
    textAlign:"center"
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#00000006',
    marginBottom: 22,
  },
  endereco: {
    flex: 1,
    textAlign:"center"
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
    letterSpacing: 0.4,
  },
});