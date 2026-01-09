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

const EXEMPLO_ANUNCIO = 'https://firebasestorage.googleapis.com/v0/b/appguiacomercial-e6109.appspot.com/o/anuncio.jpeg?alt=media&token=31c49db5-6670-454e-a662-78bc8a2cf42a';

export default function InfoPromocao({ navigation }) {
  const { colors } = useTheme();

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Título principal */}
      <View style={styles.header}>
        <Text style={styles.title}>Coloque seu anúncio no topo</Text>
        <Text style={styles.subtitle}>e receba mais mensagens no WhatsApp todos os dias</Text>
      </View>

      {/* Exemplo do anúncio destacado */}
      {/* <View style={styles.exampleContainer}>
        <Text style={styles.exampleTitle}>Veja como seu anúncio ficará em destaque</Text>
        <Image 
          source={{ uri: EXEMPLO_ANUNCIO }} 
          style={styles.exampleImage} 
          resizeMode="contain" 
        />
      </View> */}

      {/* Introdução */}
      <View style={styles.introContainer}>
        <Text style={styles.introText}>
          {`O Busca Zap é usado por centenas de pessoas todos os dias em Teresina para encontrar produtos e serviços e falar direto no seu WhatsApp. 
          Com um plano de destaque, seu anuncio aparece primeiro — aumentando muito suas chances de contato com clientes.`}
        </Text>
      </View>

      {/* Plano 1 - Anúncio Fixo */}
      <View style={styles.planCard}>
        <Text style={styles.planBadge}>MAIS VISIBILIDADE</Text>
        <Text style={styles.planTitle}>Anúncio Fixo no Topo</Text>
        <Text style={styles.planPrice}>R$ 14,90 por 30 dias</Text>

        <Text style={styles.planDescription}>
          Seu anúncio fica sempre visível no topo da tela inicial do app.
        </Text>

        <Text style={styles.planHighlight}>
          Perfeito para quem quer fortalecer a marca e ser lembrado como referência na cidade.
        </Text>

        <Pressable 
          style={[styles.actionButton, { backgroundColor: colors.botao }]}
          onPress={() => navigation.navigate('Proposta', { plano: 'fixo' })}
        >
          <Text style={styles.actionText}>Quero este</Text>
        </Pressable>
      </View>

      {/* Plano 2 - Anúncio de Busca */}
      <View style={styles.planCard}>
        <Text style={styles.planBadge}>MAIS VENDAS</Text>
        <Text style={styles.planTitle}>Anúncio no Topo da Busca</Text>
        <Text style={styles.planPrice}>R$ 7,90 por 30 dias</Text>

        <Text style={styles.planDescription}>
          Quando alguém buscar por palavras que você definiu nas palavras-chave do seu anúncio (como "pizza", "farmácia", "entrega" etc.), seu anúncio aparecerá no topo dos resultados.
        </Text>

        <Text style={styles.planHighlight}>
          Ideal para quem quer receber mensagens de clientes já prontos para negociar.
        </Text>

        <Pressable 
          style={[styles.actionButton, { backgroundColor: colors.botao }]}
          onPress={() => navigation.navigate('Proposta', { plano: 'busca' })}
        >
          <Text style={styles.actionText}>Quero este</Text>
        </Pressable>
      </View>

      {/* Rodapé tranquilizador */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          • Sem contrato de fidelidade{'\n'}
          • Você escolhe quanto tempo quer ficar em destaque{'\n'}
          • Pagamento mensal simples via PIX{'\n'}
          • Suporte direto por WhatsApp
        </Text>
        <Text style={styles.footerCall}>
          Comece hoje e veja o seu WhatsApp tocar mais!
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
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 38,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 12,
    color: '#555',
    lineHeight: 26,
  },
  exampleContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  exampleTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  exampleImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1.8, // ajuste conforme a proporção real da imagem
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    elevation: 8,
  },
  introContainer: {
    paddingHorizontal: 30,
    marginVertical: 40,
  },
  introText: {
    fontSize: 16.5,
    lineHeight: 26,
    textAlign: 'center',
    color: '#444',
  },
  planCard: {
    marginHorizontal: 24,
    marginBottom: 32,
    padding: 28,
    backgroundColor: '#fff',
    borderRadius: 24,
    alignItems: 'center',
    elevation: 6,
  },
  planBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 16,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 20,
  },
  planDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    lineHeight: 24,
    marginBottom: 16,
  },
  planHighlight: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    color: '#333',
    lineHeight: 24,
    marginBottom: 28,
  },
  actionButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  actionText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 30,
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  footerText: {
    fontSize: 15.5,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  footerCall: {
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    color: '#333',
  },
});