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
    if (!form.tags.trim()) return Alert.alert('Erro', 'Informe pelo menos 1 palavra-chave');
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

          <View style={{ backgroundColor: colors.card, borderRadius: 16 }}>

            <Text style={styles.label}>Nome *</Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={form.nome}
              onChangeText={t => setForm({ ...form, nome: t })}
              placeholder="Ex: Pizzaria do Zé"
              
            />
          </View>
{/* 
          <View style={{ backgroundColor: colors.card, borderRadius: 16 }}>

            <Text style={styles.label}>Categoria *</Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={form.categoria}
              onChangeText={t => setForm({ ...form, categoria: t })}
              placeholder="Ex: Restaurante, Farmácia"
            />
          </View> */}

          <View style={{ backgroundColor: colors.card, borderRadius: 16 }}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.inputMultiline, { color: colors.text }]}
              value={form.descricao}
              onChangeText={t => setForm({ ...form, descricao: t })}
              placeholder="Fale sobre seu negócio..."
              multiline
            />
          </View>

          <View style={{ backgroundColor: colors.card, borderRadius: 16 }}>

            <Text style={styles.label}>Endereço</Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={form.complemento}
              onChangeText={t => setForm({ ...form, complemento: t })}
              placeholder="Rua, nº"
            />
          </View>

          <View style={{ backgroundColor: colors.card, borderRadius: 16 }}>
            <Text style={styles.label}>Bairro</Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={form.bairro}
              onChangeText={t => setForm({ ...form, bairro: t })}
              placeholder="Centro"
            />

          </View>

          <View style={{ backgroundColor: colors.card, borderRadius: 16 }}>

            <Text style={styles.label}>WhatsApp (com DDD) *</Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={form.whatsapp}
              onChangeText={t => setForm({ ...form, whatsapp: t })}
              placeholder="(99) 99999-9999"
              keyboardType="phone-pad"
            />
          </View>

          <View style={{ backgroundColor: colors.card, borderRadius: 16 }}>

            <Text style={styles.label}>Palavras-chave (Separe por virgula) *</Text>
            <TextInput
              style={[styles.inputMultiline, { color: colors.text }]}
              value={form.tags}
              onChangeText={t => setForm({ ...form, tags: t })}
              placeholder="pizza, delivery, entrega grátis"

            />
          </View>

                    <Text style={[styles.footer, { color: colors.text + '70' }]}>
            Analisaremos seu cadastro e entraremos em contato em até 24h.
          </Text>

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


        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  card: {
    padding: 20,
    paddingBottom: 30,
    gap: 12

  },
  label: {
    fontSize: 13,
    marginTop: 10,
    marginLeft: 16,
    marginBottom: -6
  },
  input: {
    borderRadius: 16,
    paddingHorizontal: 18,
    fontSize: 15,
  },
  inputMultiline: {
    borderRadius: 16,
    paddingHorizontal: 18,
    fontSize: 15,
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
    marginTop: 20,
    paddingHorizontal:22,
    lineHeight: 18,
  },
});