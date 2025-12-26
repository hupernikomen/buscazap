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
  Switch,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebaseConnection/firebase';

export default function Proposta({ navigation }) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    complemento: '',
    bairro: '',
    whatsapp: '',
    tags: '',
    fazEntrega: false,
    abertoDomingo: false,
    temIntervaloAlmoco: false, // Novo: possui intervalo de almoço?
    // Horários padrão
    semanaAbre: '08:00',
    semanaFecha: '18:00',
    sabadoAbre: '08:00',
    sabadoFecha: '13:00',
    domingoAbre: '09:00',
    domingoFecha: '13:00',
    // Intervalo de almoço
    intervaloInicio: '12:00',
    intervaloRetorno: '13:30',
  });

  const [errors, setErrors] = useState({
    nome: false,
    complemento: false,
    bairro: false,
    whatsapp: false,
    tags: false,
  });

  // Máscara WhatsApp
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
      return;
    }

    setLoading(true);

    try {
      const whatsappNumbers = form.whatsapp.replace(/\D/g, '');

      const horarios = {
        semana: {
          abre: form.semanaAbre.trim(),
          fecha: form.semanaFecha.trim(),
        },
        sabado: {
          abre: form.sabadoAbre.trim(),
          fecha: form.sabadoFecha.trim(),
        },
        // Domingo opcional
        ...(form.abertoDomingo && {
          domingo: {
            abre: form.domingoAbre.trim(),
            fecha: form.domingoFecha.trim(),
          },
        }),
        // Intervalo de almoço opcional
        intervalo: {
          global: form.temIntervaloAlmoco,
          inicio: form.temIntervaloAlmoco ? form.intervaloInicio.trim() : '12:00',
          retorno: form.temIntervaloAlmoco ? form.intervaloRetorno.trim() : '13:30',
        },
      };

      await addDoc(collection(db, 'propostas'), {
        nome: form.nome.trim(),
        endereco: {
          complemento: form.complemento.trim(),
          bairro: form.bairro.trim(),
        },
        descricao: '',
        categoria: '',
        whatsapp: { principal: whatsappNumbers },
        tags: form.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
        fazEntrega: form.fazEntrega,
        horarios,
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
      console.error('Erro ao enviar proposta:', error);
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

          {/* Título principal */}
                <View style={styles.header}>
                  <Text style={styles.title}>É grátis, fácil e rápido</Text>
                  <Text style={styles.subtitle}>Preencha o formulário de anúncio, todos os campos são obrigatórios</Text>
                </View>

          {/* Nome */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16 }}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={[styles.input, { color: colors.text }, errors.nome && styles.inputError]}
              value={form.nome}
              onChangeText={(t) => {
                setForm({ ...form, nome: t.slice(0, 30) });
                if (errors.nome) setErrors({ ...errors, nome: false });
              }}
              placeholder="Ex: Pizzaria do Zé"
              maxLength={30}
            />
            {errors.nome && <Text style={styles.errorText}>Campo obrigatório</Text>}
          </View>

          {/* Endereço */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16 }}>
            <Text style={styles.label}>Endereço (rua e número)</Text>
            <TextInput
              style={[styles.input, { color: colors.text }, errors.complemento && styles.inputError]}
              value={form.complemento}
              onChangeText={(t) => {
                setForm({ ...form, complemento: t });
                if (errors.complemento) setErrors({ ...errors, complemento: false });
              }}
              placeholder="Ex: Av. Joaquim Nelson, 123"
            />
            {errors.complemento && <Text style={styles.errorText}>Campo obrigatório</Text>}
          </View>

          {/* Bairro */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16 }}>
            <Text style={styles.label}>Bairro</Text>
            <TextInput
              style={[styles.input, { color: colors.text }, errors.bairro && styles.inputError]}
              value={form.bairro}
              onChangeText={(t) => {
                setForm({ ...form, bairro: t });
                if (errors.bairro) setErrors({ ...errors, bairro: false });
              }}
              placeholder="Ex: Centro"
            />
            {errors.bairro && <Text style={styles.errorText}>Campo obrigatório</Text>}
          </View>

          {/* WhatsApp */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16 }}>
            <Text style={styles.label}>WhatsApp (com DDD)</Text>
            <TextInput
              style={[styles.input, { color: colors.text }, errors.whatsapp && styles.inputError]}
              value={form.whatsapp}
              onChangeText={handleWhatsAppChange}
              placeholder="(86) 99999-9999"
              keyboardType="phone-pad"
              maxLength={15}
            />
            {errors.whatsapp && <Text style={styles.errorText}>WhatsApp inválido</Text>}
          </View>

          {/* Faz entregas? */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16, paddingVertical: 8 }}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Faz entregas?</Text>
              <Switch
                value={form.fazEntrega}
                onValueChange={(value) => setForm({ ...form, fazEntrega: value })}
                trackColor={{ false: '#767577', true: colors.botao }}
                thumbColor={form.fazEntrega ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Horários de Funcionamento */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16, paddingVertical: 12 }}>
            <Text style={[styles.sectionTitle]}>Horários</Text>

            {/* Segunda a Sexta */}
            <View style={styles.horarioRow}>
              <Text style={styles.horarioDia}>Segunda a Sexta</Text>
              <TextInput
                style={styles.horarioInput}
                value={form.semanaAbre}
                onChangeText={(t) => setForm({ ...form, semanaAbre: t })}
                placeholder="08:00"
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
              <Text style={styles.horarioSeparator}>às</Text>
              <TextInput
                style={styles.horarioInput}
                value={form.semanaFecha}
                onChangeText={(t) => setForm({ ...form, semanaFecha: t })}
                placeholder="18:00"
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
            </View>

            {/* Sábado */}
            <View style={styles.horarioRow}>
              <Text style={styles.horarioDia}>Sábado</Text>
              <TextInput
                style={styles.horarioInput}
                value={form.sabadoAbre}
                onChangeText={(t) => setForm({ ...form, sabadoAbre: t })}
                placeholder="08:00"
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
              <Text style={styles.horarioSeparator}>às</Text>
              <TextInput
                style={styles.horarioInput}
                value={form.sabadoFecha}
                onChangeText={(t) => setForm({ ...form, sabadoFecha: t })}
                placeholder="13:00"
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
            </View>

            {/* Domingo */}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Aberto aos domingos?</Text>
              <Switch
                value={form.abertoDomingo}
                onValueChange={(value) => setForm({ ...form, abertoDomingo: value })}
                trackColor={{ false: '#767577', true: colors.botao }}
                thumbColor={form.abertoDomingo ? '#fff' : '#f4f3f4'}
              />
            </View>

            {form.abertoDomingo && (
              <View style={styles.horarioRow}>
                <Text style={styles.horarioDia}>Domingo</Text>
                <TextInput
                  style={styles.horarioInput}
                  value={form.domingoAbre}
                  onChangeText={(t) => setForm({ ...form, domingoAbre: t })}
                  placeholder="09:00"
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
                <Text style={styles.horarioSeparator}>às</Text>
                <TextInput
                  style={styles.horarioInput}
                  value={form.domingoFecha}
                  onChangeText={(t) => setForm({ ...form, domingoFecha: t })}
                  placeholder="13:00"
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              </View>
            )}

            {/* Intervalo de Almoço */}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Possui intervalo de almoço?</Text>
              <Switch
                value={form.temIntervaloAlmoco}
                onValueChange={(value) => setForm({ ...form, temIntervaloAlmoco: value })}
                trackColor={{ false: '#767577', true: colors.botao }}
                thumbColor={form.temIntervaloAlmoco ? '#fff' : '#f4f3f4'}
              />
            </View>

            {form.temIntervaloAlmoco && (
              <View style={styles.horarioRow}>
                <Text style={styles.horarioDia}>Intervalo</Text>
                <TextInput
                  style={styles.horarioInput}
                  value={form.intervaloInicio}
                  onChangeText={(t) => setForm({ ...form, intervaloInicio: t })}
                  placeholder="12:00"
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
                <Text style={styles.horarioSeparator}>às</Text>
                <TextInput
                  style={styles.horarioInput}
                  value={form.intervaloRetorno}
                  onChangeText={(t) => setForm({ ...form, intervaloRetorno: t })}
                  placeholder="13:30"
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              </View>
            )}
          </View>

          {/* Palavras-chave */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16 }}>
            <Text style={styles.label}>Palavras-chave (separadas por vírgula)</Text>
            <TextInput
              style={[styles.inputMultiline, { color: colors.text }, errors.tags && styles.inputError]}
              value={form.tags}
              onChangeText={(t) => {
                setForm({ ...form, tags: t });
                if (errors.tags) setErrors({ ...errors, tags: false });
              }}
              placeholder="pizza, delivery, açaí, 24h, promoção"
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
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 12,
    color: '#555',
  },
  card: {
    paddingBottom: 30,
    gap: 12,
  },
  label: {
    fontSize: 13,
    marginTop: 10,
    marginLeft: 18,
    fontWeight:500,
    marginBottom: -6,
  },
  sectionTitle: {
    fontWeight:500,
    marginLeft: 16,
    marginBottom: 8,
    color: '#333',
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
    fontSize:16,
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 15,
    color: '#333',
  },
  horarioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  horarioDia: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  horarioInput: {
    width: 70,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    textAlign: 'center',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  horarioSeparator: {
    fontSize: 15,
    color: '#555',
  },
});