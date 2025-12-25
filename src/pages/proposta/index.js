// src/pages/proposta/PropostaScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
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
    descricao: '',
    complemento: '',
    bairro: '',
    whatsapp: '',
    tags: '',
  });

  const [errors, setErrors] = useState({
    nome: false,
    complemento: false,
    bairro: false,
    whatsapp: false,
    tags: false,
  });

  // Máscara WhatsApp: (DD) 99999-9999
  const formatWhatsApp = (text) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleWhatsAppChange = (text) => {
    const formatted = formatWhatsApp(text);
    setForm({ ...form, whatsapp: formatted });
    if (errors.whatsapp) setErrors({ ...errors, whatsapp: false });
  };

  const validateAndSubmit = async () => {
    const newErrors = {
      nome: !form.nome.trim(),
      complemento: !form.complemento.trim(),
      bairro: !form.bairro.trim(),
      whatsapp: form.whatsapp.replace(/\D/g, '').length < 11,
      tags: !form.tags.trim(),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      return; // Para se houver erro
    }

    setLoading(true);

    try {
      const whatsappNumbers = form.whatsapp.replace(/\D/g, '');

      await addDoc(collection(db, 'propostas'), {
        nome: form.nome.trim(),
        descricao: form.descricao.trim(),
        endereco: {
          complemento: form.complemento.trim(),
          bairro: form.bairro.trim(),
        },
        whatsapp: { principal: whatsappNumbers },
        tags: form.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
        criadoEm: serverTimestamp(),
        anuncio: {
          postagem: true,
          busca: false,
          premium: false,
        },
        status: false,
      });

      navigation.goBack();
    } catch (error) {
      console.error(error);
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

          {/* Nome */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16 }}>
            <Text style={styles.label}>Nome *</Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text },
                errors.nome && styles.inputError,
              ]}
              value={form.nome}
              onChangeText={(t) => {
                setForm({ ...form, nome: t.slice(0, 30) });
                if (errors.nome) setErrors({ ...errors, nome: false });
              }}
              placeholder="Ex: Pizzaria do Zé"
              maxLength={30}
            />
            <Text style={styles.counter}>{form.nome.length}/30</Text>
            {errors.nome && <Text style={styles.errorText}>Campo obrigatório</Text>}
          </View>

          {/* Descrição */}
          {/* <View style={{ backgroundColor: colors.card, borderRadius: 16 }}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.inputMultiline, { color: colors.text }]}
              value={form.descricao}
              onChangeText={(t) => setForm({ ...form, descricao: t.slice(0, 100) })}
              placeholder="Fale sobre seu negócio..."
              multiline
              maxLength={100}
            />
            <Text style={styles.counter}>{form.descricao.length}/100</Text>
          </View> */}

          {/* Endereço */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16 }}>
            <Text style={styles.label}>Endereço</Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text },
                errors.complemento && styles.inputError,
              ]}
              value={form.complemento}
              onChangeText={(t) => {
                setForm({ ...form, complemento: t });
                if (errors.complemento) setErrors({ ...errors, complemento: false });
              }}
              placeholder="Rua, nº"
            />
            {errors.complemento && <Text style={styles.errorText}>Campo obrigatório</Text>}
          </View>

          {/* Bairro */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16 }}>
            <Text style={styles.label}>Bairro</Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text },
                errors.bairro && styles.inputError,
              ]}
              value={form.bairro}
              onChangeText={(t) => {
                setForm({ ...form, bairro: t });
                if (errors.bairro) setErrors({ ...errors, bairro: false });
              }}
              placeholder="Centro"
            />
            {errors.bairro && <Text style={styles.errorText}>Campo obrigatório</Text>}
          </View>

          {/* WhatsApp */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16 }}>
            <Text style={styles.label}>WhatsApp (com DDD) *</Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text },
                errors.whatsapp && styles.inputError,
              ]}
              value={form.whatsapp}
              onChangeText={handleWhatsAppChange}
              placeholder="(99) 99999-9999"
              keyboardType="phone-pad"
              maxLength={15}
            />
            {errors.whatsapp && <Text style={styles.errorText}>WhatsApp inválido</Text>}
          </View>

          {/* Palavras-chave */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16 }}>
            <Text style={styles.label}>Palavras-chave (Separe por virgula) *</Text>
            <TextInput
              style={[
                styles.inputMultiline,
                { color: colors.text },
                errors.tags && styles.inputError,
              ]}
              value={form.tags}
              onChangeText={(t) => {
                setForm({ ...form, tags: t });
                if (errors.tags) setErrors({ ...errors, tags: false });
              }}
              placeholder="pizza, delivery, entrega grátis"
              multiline
            />
            {errors.tags && <Text style={styles.errorText}>Campo obrigatório</Text>}
          </View>

          <Text style={[styles.footer, { color: colors.text + '70' }]}>
            Analisaremos seu cadastro e entraremos em contato em até 24h.
          </Text>

          <Pressable
            onPress={validateAndSubmit}
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
  container: {
    padding: 20,
    paddingBottom: 30,
  },
  card: {
    paddingBottom: 30,
    gap: 12,
  },
  label: {
    fontSize: 13,
    marginTop: 10,
    marginLeft: 16,
    marginBottom: -6,
  },
  input: {
    borderRadius: 16,
    paddingHorizontal: 18,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputMultiline: {
    borderRadius: 16,
    paddingHorizontal: 18,
    fontSize: 15,
    textAlignVertical: 'top',
    height: 100,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#F44336',
    borderWidth: 1,
  },
  counter: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    paddingHorizontal: 18,
    marginTop: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#F44336',
    fontWeight: '500',
    paddingHorizontal: 18,
    marginTop: 6,
    marginBottom: 8,
  },
  footer: {
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 22,
    lineHeight: 18,
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
});