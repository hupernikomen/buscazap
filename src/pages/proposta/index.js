// src/pages/Proposta.js

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
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../services/firebaseConnection/firebase';

export default function Proposta({ navigation }) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    whatsappInput: '',
    whatsappNumero: '',
    bairro: '',
    tags: '',
    descricao: '',
    fazEntrega: false,
  });

  const [errors, setErrors] = useState({
    nome: false,
    whatsapp: false,
    bairro: false,
    whatsappDuplicado: '',
  });

  const formatWhatsApp = (text) => {
    const numbers = text.replace(/\D/g, '').slice(0, 11);
    if (numbers.length === 0) return '';

    const ddd = numbers.slice(0, 2);
    if (numbers.length <= 2) return `(${numbers}`;

    if (numbers.length <= 7) return `(${ddd}) ${numbers.slice(2)}`;

    const parte1 = numbers.slice(2, 7);
    const parte2 = numbers.slice(7);
    return `(${ddd}) ${parte1}-${parte2}`;
  };

  const handleWhatsAppChange = (text) => {
    const formatted = formatWhatsApp(text);
    const numeroLimpo = text.replace(/\D/g, '').slice(0, 11);

    setForm((prev) => ({
      ...prev,
      whatsappInput: formatted,
      whatsappNumero: numeroLimpo,
    }));

    setErrors((prev) => ({ ...prev, whatsapp: false, whatsappDuplicado: '' }));
  };

  const verificaWhatsappDuplicado = async (numeroLimpo) => {
    const checkInCollection = async (colName) => {
      const snapshot = await getDocs(collection(db, colName));
      return snapshot.docs.some((doc) => {
        const data = doc.data();
        if (data.filiais?.length > 0) {
          return data.filiais.some((f) => f.whatsapp?.numero === numeroLimpo);
        }
        if (Array.isArray(data.whatsapp)) {
          return data.whatsapp.some((w) => w.numero === numeroLimpo);
        }
        return data.whatsapp?.principal === numeroLimpo;
      });
    };

    const emUsers = await checkInCollection('users');
    const emPropostas = await checkInCollection('propostas');

    return { emUsers, emPropostas };
  };

  const validateAndSubmit = async () => {
    const newErrors = {
      nome: !form.nome.trim(),
      whatsapp: form.whatsappNumero.length < 10,
      bairro: !form.bairro.trim(),
      whatsappDuplicado: '',
    };

    setErrors(newErrors);

    if (newErrors.nome || newErrors.whatsapp || newErrors.bairro) return;

    setLoading(true);

    try {
      const { emUsers, emPropostas } = await verificaWhatsappDuplicado(form.whatsappNumero);

      if (emPropostas) {
        setErrors((prev) => ({
          ...prev,
          whatsappDuplicado: 'Você já enviou uma proposta com este número.',
        }));
        return;
      }

      if (emUsers) {
        setErrors((prev) => ({
          ...prev,
          whatsappDuplicado: 'Este número já tem um anúncio ativo no app.',
        }));
        return;
      }

      await addDoc(collection(db, 'propostas'), {
        nome: form.nome.trim(),
        bairro: form.bairro.trim(),
        descricao: form.descricao.trim() || null,
        tags: form.tags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
        fazEntrega: form.fazEntrega,
        filiais: [
          {
            bairro: form.bairro.trim(),
            whatsapp: { numero: form.whatsappNumero, principal: true },
            fazEntrega: form.fazEntrega,
          },
        ],
        criadoEm: serverTimestamp(),
        anuncio: { postagem: true, busca: false, premium: false },
        status: 'pendente',
      });

      Alert.alert(
        'Solicitação enviada com sucesso!',
        'Obrigado pelo interesse! Entraremos em contato pelo WhatsApp em até 24 horas.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Erro ao enviar proposta:', error);
      Alert.alert('Erro', 'Não foi possível enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Anuncie no Busca Zap!</Text>
        <Text style={styles.subtitle}>
          Preencha sua proposta de anúncio.
        </Text>
        <Text style={styles.subtitle}>
          É rápido e grátis!
        </Text>

        <View style={styles.formContainer}>
          {/* Nome */}
          <Text style={styles.label}>Nome do negócio *</Text>
          <TextInput
            style={[styles.input, errors.nome && styles.inputError]}
            placeholder="Ex: Pizzaria do Zé"
            placeholderTextColor="#999"
            value={form.nome}
            onChangeText={(t) => setForm((prev) => ({ ...prev, nome: t.slice(0, 40) }))}
            maxLength={40}
          />
          {errors.nome && <Text style={styles.errorText}>Preencha o nome</Text>}

          {/* WhatsApp */}
          <Text style={styles.label}>WhatsApp com DDD *</Text>
          <TextInput
            style={[styles.input, (errors.whatsapp || errors.whatsappDuplicado) && styles.inputError]}
            placeholder="(86) 99999-9999"
            placeholderTextColor="#999"
            value={form.whatsappInput}
            onChangeText={handleWhatsAppChange}
            keyboardType="phone-pad"
            maxLength={15}
          />
          {(errors.whatsapp || errors.whatsappDuplicado) && (
            <Text style={styles.errorText}>
              {errors.whatsappDuplicado || 'WhatsApp inválido'}
            </Text>
          )}

          {/* Bairro */}
          <Text style={styles.label}>Bairro principal *</Text>
          <TextInput
            style={[styles.input, errors.bairro && styles.inputError]}
            placeholder="Ex: Centro, Dirceu"
            placeholderTextColor="#999"
            value={form.bairro}
            onChangeText={(t) => setForm((prev) => ({ ...prev, bairro: t.slice(0, 40) }))}
            maxLength={40}
          />
          {errors.bairro && <Text style={styles.errorText}>Preencha o bairro</Text>}

          {/* Tags */}
          <Text style={styles.label}>Tags (separadas por vírgula)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: pizza, delivery, açai, farmácia"
            placeholderTextColor="#999"
            value={form.tags}
            onChangeText={(t) => setForm((prev) => ({ ...prev, tags: t }))}
          />

          {/* Descrição */}
          <Text style={styles.label}>Descrição do negócio (opcional)</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Fale um pouco sobre seu negócio, diferenciais..."
            placeholderTextColor="#999"
            value={form.descricao}
            onChangeText={(t) => setForm((prev) => ({ ...prev, descricao: t.slice(0, 150) }))}
            multiline
            maxLength={150}
          />

          {/* Faz entrega */}
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Fazemos entregas</Text>
            <Switch
              value={form.fazEntrega}
              onValueChange={(v) => setForm((prev) => ({ ...prev, fazEntrega: v }))}
              trackColor={{ false: '#ccc', true: colors.botao }}
              thumbColor="#fff"
            />
          </View>

          <Text style={styles.infoText}>
            Analisaremos sua proposta em até 24 horas e entraremos em contato pelo WhatsApp informado.
          </Text>

          <Pressable
            onPress={validateAndSubmit}
            disabled={loading}
            style={[styles.submitButton, { backgroundColor: colors.botao }]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitText}>Enviar Proposta</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal:22,
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
  },
  formContainer: {
    marginTop:32,
    gap: 6
  },
  label: {
    marginTop: 22,
    fontSize: 15,
    fontWeight: '500',
    color: '#444',
    marginLeft: 18,
    marginBottom: 2,  // ← Agora bem colado no input
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#eee',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  infoText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginVertical: 20,
  },
  submitButton: {
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});