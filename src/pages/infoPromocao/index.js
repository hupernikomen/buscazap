// src/pages/promocao/InfoPromocao.js

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Linking,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const NUMERO_WHATSAPP = '86994773403'; // Seu número para contato

export default function InfoPromocao({ navigation }) {
  const { colors } = useTheme();

  const abrirWhatsApp = (plano) => {
    let mensagem = '';

    if (plano === 'fixo') {
      mensagem = `Olá! Gostaria de contratar o plano *Anúncio Fixo no Topo* por R$ 14,90 (30 dias). Meu anúncio deve ficar sempre no topo da tela inicial do Busca Zap Teresina.`;
    } else if (plano === 'busca') {
      mensagem = `Olá! Gostaria de contratar o plano *Anúncio no Topo da Busca* por R$ 7,90 (30 dias). Quero aparecer no topo quando as pessoas buscarem pelas minhas palavras-chave.`;
    }

    const url = `https://wa.me/55${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;

    Linking.openURL(url).catch(() => {
      alert('Não foi possível abrir o WhatsApp. Verifique se o app está instalado.');
    });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>Aumente suas vendas com destaque</Text>
        <Text style={styles.subtitle}>
          Apareça no topo e receba mais mensagens no WhatsApp todos os dias
        </Text>
      </View>

      {/* Introdução */}
      <Text style={styles.introText}>
        Centenas de pessoas usam o Busca Zap Teresina diariamente para encontrar produtos e serviços.
        Com um plano de destaque, seu anúncio aparece primeiro — aumentando muito suas chances de contato com clientes interessados.
      </Text>

      {/* Plano Fixo no Topo */}
      <View style={styles.planContainer}>
        <View style={styles.planHeader}>
          <Text style={styles.planBadge}>MAIS VISIBILIDADE</Text>
        </View>
        <Text style={styles.planTitle}>Anúncio Fixo no Topo</Text>
        <Text style={styles.planPrice}>R$ 14,90 <Text style={{ fontSize: 16, fontWeight: '400' }}>por 30 dias</Text></Text>

        <Text style={styles.planDescription}>
          Seu anúncio fica sempre visível no topo da tela inicial do app, mesmo quando o usuário não está buscando nada.
        </Text>

        <Text style={styles.planHighlight}>
          Ideal para fortalecer sua marca e ser lembrado como referência na cidade.
        </Text>

        <Pressable
          style={[styles.actionButton, { backgroundColor: colors.botao }]}
          onPress={() => abrirWhatsApp('fixo')}
        >
          <Ionicons name="logo-whatsapp" size={22} color="#fff" />
          <Text style={styles.actionText}>Quero este plano</Text>
        </Pressable>
      </View>

      {/* Plano Topo da Busca */}
      <View style={styles.planContainer}>
        <View style={styles.planHeader}>
          <Text style={[styles.planBadge, { backgroundColor: '#4CAF50' }]}>MAIS VENDAS</Text>
        </View>
        <Text style={styles.planTitle}>Anúncio no Topo da Busca</Text>
        <Text style={styles.planPrice}>R$ 7,90 <Text style={{ fontSize: 16, fontWeight: '400' }}>por 30 dias</Text></Text>

        <Text style={styles.planDescription}>
          Seu anúncio aparece no topo dos resultados quando alguém busca por palavras relacionadas ao seu negócio (pizza, farmácia, entrega, etc.).
        </Text>

        <Text style={styles.planHighlight}>
          Perfeito para quem quer receber mensagens de clientes já prontos para comprar.
        </Text>

        <Pressable
          style={[styles.actionButton, { backgroundColor: colors.botao }]}
          onPress={() => abrirWhatsApp('busca')}
        >
          <Ionicons name="logo-whatsapp" size={22} color="#fff" />
          <Text style={styles.actionText}>Quero este plano</Text>
        </Pressable>
      </View>

      {/* Vantagens finais */}
      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>Tudo simples e sem complicação:</Text>
        <Text style={styles.benefitItem}>• Sem contrato ou fidelidade</Text>
        <Text style={styles.benefitItem}>• Você escolhe quanto tempo quer anunciar</Text>
        <Text style={styles.benefitItem}>• Pagamento fácil via PIX</Text>
        <Text style={styles.benefitItem}>• Suporte direto por WhatsApp</Text>
      </View>

      <Text style={styles.finalCall}>
        Comece hoje mesmo e veja seu WhatsApp tocar mais!
      </Text>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: '#f9f9f9',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    color: '#333',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    color: '#555',
    marginTop: 12,
    lineHeight: 24,
  },
  introText: {
    fontSize: 16,
    lineHeight: 25,
    textAlign: 'center',
    color: '#444',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  planContainer: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    alignItems: 'center',
  },
  planHeader: {
    marginBottom: 16,
  },
  planBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
  },
  planTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  planDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    lineHeight: 24,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  planHighlight: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 50,
    width: '100%',
  },
  actionText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  benefitsContainer: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    alignItems: 'center',
  },
  benefitsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  benefitItem: {
    fontSize: 16,
    color: '#555',
    lineHeight: 26,
    textAlign: 'center',
  },
  finalCall: {
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    color: '#333',
    lineHeight: 28,
    paddingHorizontal: 20,
  },
});