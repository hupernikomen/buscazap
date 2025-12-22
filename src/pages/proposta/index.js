// src/pages/proposta/PropostaScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebaseConnection/firebase';

export default function Proposta({ navigation }) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    categoria: '',
    descricao: '',
    bairro: '',
    complemento: '',
    whatsapp: '',
    tags: '',
  });

  const handleSubmit = async () => {
    if (!form.nome.trim()) return Alert.alert('Erro', 'Nome é obrigatório');
    if (!form.categoria.trim()) return Alert.alert('Erro', 'Categoria é obrigatória');
    if (form.whatsapp.replace(/\D/g, '').length < 10) return Alert.alert('Erro', 'WhatsApp inválido');

    setLoading(true);

    try {
      await addDoc(collection(db, 'propostas'), {
        nome: form.nome.trim(),
        categoria: form.categoria.trim(),
        descricao: form.descricao.trim(),
        endereco: {
          bairro: form.bairro.trim(),
          complemento: form.complemento.trim(),
        },
        whatsapp: { principal: form.whatsapp.replace(/\D/g, '') },
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        criadoEm: serverTimestamp(),
        anuncio: {
          postagem: true,
          busca: false,
          premium: false
        },
        status: false,
      });

      Alert.alert(
        'Proposta enviada!',
        'Entraremos em contato em breve pelo WhatsApp.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Falha ao enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>


        <View style={styles.card}>
          <Text style={styles.label}>Nome do estabelecimento *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            value={form.nome}
            onChangeText={t => setForm({ ...form, nome: t })}
            placeholder="Ex: Pizzaria do Zé"
          />

          <Text style={styles.label}>Categoria *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            value={form.categoria}
            onChangeText={t => setForm({ ...form, categoria: t })}
            placeholder="Ex: Restaurante, Farmácia"
          />

          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.inputMultiline, { backgroundColor: colors.card, color: colors.text }]}
            value={form.descricao}
            onChangeText={t => setForm({ ...form, descricao: t })}
            placeholder="Fale sobre seu negócio..."
            multiline
          />

                      <View style={{ flex: 1 }}>
              <Text style={styles.label}>Endereço</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                value={form.complemento}
                onChangeText={t => setForm({ ...form, complemento: t })}
                placeholder="Rua, nº"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Bairro</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                value={form.bairro}
                onChangeText={t => setForm({ ...form, bairro: t })}
                placeholder="Centro"
              />

          </View>

          <Text style={styles.label}>WhatsApp (com DDD) *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            value={form.whatsapp}
            onChangeText={t => setForm({ ...form, whatsapp: t })}
            placeholder="(99) 99999-9999"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Palavras-chave (opcional)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            value={form.tags}
            onChangeText={t => setForm({ ...form, tags: t })}
            placeholder="pizza, delivery, aberto agora"
          />

          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            style={[styles.button, { backgroundColor: colors.botao }]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Enviar Solicitação</Text>
            )}
          </Pressable>

          <Text style={[styles.footer, { color: colors.text + '70' }]}>
            Analisaremos seu cadastro e entraremos em contato em até 24h.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  card: {
    padding: 20,
    paddingBottom: 30,

  },
  label: {
    fontSize: 15,
    fontWeight: '400',
    marginTop: 16,
    marginLeft:16,
    marginBottom:4
  },
  input: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
  },
  inputMultiline: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    height: 100,
  },
  row: {
    flexDirection: 'row',
    marginTop: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 20,
    borderRadius: 22,
    marginVertical: 30,
    elevation: 14,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 20,
    lineHeight: 18,
  },
});