// src/pages/promocao/InfoPromocao.js
import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const EXEMPLO_ANUNCIO = 'https://firebasestorage.googleapis.com/v0/b/appguiacomercial-e6109.appspot.com/o/anuncio.jpeg?alt=media&token=31c49db5-6670-454e-a662-78bc8a2cf42a';

export default function InfoPromocao({ navigation }) {
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Exemplo visual do anúncio promovido */}
      <View style={styles.exampleSection}>
        <Image source={{ uri: EXEMPLO_ANUNCIO }} style={styles.exampleImage} resizeMode="contain" />
        <Text style={styles.exampleLabel}>Assim ficará seu anúncio destacado</Text>
      </View>

      {/* Introdução */}
      <View style={styles.intro}>
        <Text style={styles.introText}>
          Escolha o plano ideal para o seu objetivo e comece a atrair mais clientes hoje mesmo.
        </Text>
      </View>

      {/* Plano Fixo */}
      <View style={styles.planContainer}>
        <View style={[styles.planCard, { borderColor: '#4CAF50' }]}>
          <Ionicons name="pin" size={40} color="#4CAF50" />
          <Text style={styles.planName}>Anúncio Fixo</Text>
          <Text style={styles.planPrice}>R$ 9,90/mês</Text>

          <Text style={styles.planInfo}>
            Fica fixado no topo da tela inicial{'\n'}
            (máximo 3 anúncios)
          </Text>

          <View style={styles.planFeatures}>
            <Text style={styles.feature}>• Visibilidade para todos os usuários</Text>
            <Text style={styles.feature}>• Fortalece sua marca</Text>
            <Text style={styles.feature}>• Presença constante</Text>
          </View>

          <Pressable 
            style={styles.planButton}
            onPress={() => navigation.navigate('Proposta', { plano: 'fixo' })}
          >
            <Text style={styles.buttonText}>Escolher este plano</Text>
          </Pressable>
        </View>

        {/* Plano Busca */}
        <View style={[styles.planCard, { borderColor: '#2196F3' }]}>
          <Ionicons name="search" size={40} color="#2196F3" />
          <Text style={styles.planName}>Anúncio de Busca</Text>
          <Text style={styles.planPrice}>R$ 6,90/mês</Text>

          <Text style={styles.planInfo}>
            Aparece no topo dos resultados{'\n'}
            quando alguém busca suas palavras-chave
          </Text>

          <View style={styles.planFeatures}>
            <Text style={styles.feature}>• Atrai clientes interessados</Text>
            <Text style={styles.feature}>• Alta chance de conversão</Text>
            <Text style={styles.feature}>• Resultados imediatos</Text>
          </View>

          <Pressable 
            style={styles.planButton}
            onPress={() => navigation.navigate('Proposta', { plano: 'busca' })}
          >
            <Text style={styles.buttonText}>Escolher este plano</Text>
          </Pressable>
        </View>
      </View>

      {/* Rodapé simples e direto */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Pagamento mensal • Cancele quando quiser • Suporte por WhatsApp
        </Text>
        <Text style={styles.footerBold}>
          Comece agora e veja sua loja no topo!
        </Text>
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 40,
  },
  mainSubtitle: {
    fontSize: 18,
    marginTop: 12,
    textAlign: 'center',
    color: '#666',
  },
  exampleSection: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  exampleLabel: {
    fontSize: 16,
    color: '#444',
    marginVertical: 16,
    textAlign: 'center',
  },
  exampleImage: {
    width: '100%',
    height: 150,
    padding:16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  intro: {
    paddingHorizontal: 30,
    marginTop: 40,
    marginBottom: 20,
  },
  introText: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 26,
    color: '#555',
  },
  planContainer: {
    paddingHorizontal: 20,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 3,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 12,
  },
  planPrice: {
    fontSize: 34,
    fontWeight: '900',
    color: '#333',
  },
  planInfo: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    lineHeight: 24,
    color: '#555',
  },
  planFeatures: {
    width: '100%',
    marginBottom: 28,
  },
  feature: {
    fontSize: 15.5,
    lineHeight: 24,
    color: '#444',
  },
  planButton: {
    backgroundColor: '#000',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  footer: {
    marginTop: 20,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    marginBottom: 12,
  },
  footerBold: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    color: '#333',
  },
});