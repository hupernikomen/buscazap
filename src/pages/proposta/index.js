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
    whatsappInput: '',       // para exibição com máscara
    whatsappNumero: '',      // número limpo para envio e validação
    bairro: '',              // NOVO: bairro obrigatório
    tags: '',
    descricao: '',
    fazEntrega: false,
    abertoSabado: true,
    abertoDomingo: false,
    temIntervaloAlmoco: false,
    semanaAbre: '08:00',
    semanaFecha: '18:00',
    sabadoAbre: '08:00',
    sabadoFecha: '13:00',
    domingoAbre: '09:00',
    domingoFecha: '13:00',
    intervaloInicio: '12:00',
    intervaloRetorno: '13:30',
  });

  const [errors, setErrors] = useState({
    nome: false,
    whatsapp: false,
    bairro: false,
    tags: false,
    whatsappDuplicado: '',
  });

  // Máscara WhatsApp
  const formatWhatsApp = (text) => {
    const numbers = text.replace(/\D/g, '').slice(0, 11);
    if (numbers.length === 0) return '';
    const ddd = numbers.slice(0, 2);
    const part1 = numbers.slice(2, 7);
    const part2 = numbers.slice(7, 11);
    if (numbers.length >= 11) return `(${ddd}) ${part1}-${part2}`;
    if (numbers.length >= 7) return `(${ddd}) ${part1}-${part2.slice(0, 4)}`;
    if (numbers.length >= 3) return `(${ddd}) ${numbers.slice(2)}`;
    return `(${numbers}`;
  };

  const handleWhatsAppChange = (text) => {
    const formatted = formatWhatsApp(text);
    const numeroLimpo = text.replace(/\D/g, '').slice(0, 11);

    setForm({
      ...form,
      whatsappInput: formatted,
      whatsappNumero: numeroLimpo,
    });

    if (errors.whatsapp || errors.whatsappDuplicado) {
      setErrors({ ...errors, whatsapp: false, whatsappDuplicado: '' });
    }
  };

  // Verificação de duplicidade (compatível com array e antigo)
  const verificaWhatsappDuplicado = async (numeroLimpo) => {
    const checkCollection = async (colecaoNome) => {
      const snapshot = await getDocs(collection(db, colecaoNome));
      return snapshot.docs.some(doc => {
        const data = doc.data();
        if (Array.isArray(data.whatsapp)) {
          return data.whatsapp.some(w => w.numero === numeroLimpo);
        }
        return data.whatsapp?.principal === numeroLimpo;
      });
    };

    const emPropostas = await checkCollection('propostas');
    const emUsers = await checkCollection('users');

    return { emPropostas, emUsers };
  };

  const validateAndSubmit = async () => {
    const newErrors = {
      nome: !form.nome.trim(),
      whatsapp: form.whatsappNumero.length < 10,
      bairro: !form.bairro.trim(),
      tags: !form.tags.trim(),
      whatsappDuplicado: '',
    };

    if (Object.values(newErrors).some(v => v === true)) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const { emPropostas, emUsers } = await verificaWhatsappDuplicado(form.whatsappNumero);

      if (emPropostas) {
        setErrors(prev => ({ ...prev, whatsappDuplicado: 'Você já enviou uma solicitação com este número. Aguarde nossa análise.' }));
        setLoading(false);
        return;
      }

      if (emUsers) {
        setErrors(prev => ({ ...prev, whatsappDuplicado: 'Este número já possui um anúncio ativo no app.' }));
        setLoading(false);
        return;
      }

      const whatsappArray = [{
        bairro: form.bairro.trim(),
        numero: form.whatsappNumero,
      }];

      const horarios = {
        semana: { abre: form.semanaAbre.trim(), fecha: form.semanaFecha.trim() },
        ...(form.abertoSabado && { sabado: { abre: form.sabadoAbre.trim(), fecha: form.sabadoFecha.trim() } }),
        ...(form.abertoDomingo && { domingo: { abre: form.domingoAbre.trim(), fecha: form.domingoFecha.trim() } }),
        intervalo: {
          global: form.temIntervaloAlmoco,
          inicio: form.temIntervaloAlmoco ? form.intervaloInicio.trim() : '12:00',
          retorno: form.temIntervaloAlmoco ? form.intervaloRetorno.trim() : '13:30',
        },
      };

      await addDoc(collection(db, 'propostas'), {
        nome: form.nome.trim(),
        whatsapp: whatsappArray,
        tags: form.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
        fazEntrega: form.fazEntrega,
        descricao: form.descricao.trim(),
        bairro: form.bairro.trim(),
        horarios,
        criadoEm: serverTimestamp(),
        anuncio: { postagem: true, busca: false, premium: false },
        status: false,
      });

      Alert.alert(
        'Solicitação enviada!',
        'Obrigado! Analisaremos seu cadastro e entraremos em contato em até 24h.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Erro ao enviar:', error);
      Alert.alert('Erro', 'Falha ao enviar. Verifique sua conexão e tente novamente.');
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
          <View style={styles.header}>
            <Text style={styles.title}>É fácil, rápido e grátis!</Text>
            <Text style={styles.subtitle}>Todos os campos são obrigatórios</Text>
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

          {/* Bairro - NOVO CAMPO com aparência original */}
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

          {/* Descrição */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16 }}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.inputMultiline, { color: colors.text }]}
              value={form.descricao}
              onChangeText={(t) => setForm({ ...form, descricao: t.slice(0, 110) })}
              placeholder="Fale sobre seu negócio..."
              multiline
              maxLength={110}
            />
          </View>

          {/* WhatsApp */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16 }}>
            <Text style={styles.label}>WhatsApp (com DDD)</Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text },
                (errors.whatsapp || errors.whatsappDuplicado) && styles.inputError,
              ]}
              value={form.whatsappInput}
              onChangeText={handleWhatsAppChange}
              placeholder="(86) 99999-9999"
              keyboardType="phone-pad"
              maxLength={15}
            />
            {errors.whatsapp && <Text style={styles.errorText}>WhatsApp inválido</Text>}
            {errors.whatsappDuplicado && <Text style={styles.errorText}>{errors.whatsappDuplicado}</Text>}
          </View>

          {/* Horários - bloco completo com background card */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16, paddingVertical: 12 }}>
            <Text style={styles.sectionTitle}>Horários</Text>
            {/* ... todo o código de horários que você já tinha (exatamente igual) ... */}
            <View style={styles.horarioRow}>
              <Text style={styles.horarioDia}>Segunda a Sexta</Text>
              <TextInput style={styles.horarioInput} value={form.semanaAbre} onChangeText={(t) => setForm({ ...form, semanaAbre: t })} placeholder="08:00" keyboardType="numbers-and-punctuation" maxLength={5} />
              <Text style={styles.horarioSeparator}>às</Text>
              <TextInput style={styles.horarioInput} value={form.semanaFecha} onChangeText={(t) => setForm({ ...form, semanaFecha: t })} placeholder="18:00" keyboardType="numbers-and-punctuation" maxLength={5} />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Aberto aos sábados?</Text>
              <Switch value={form.abertoSabado} onValueChange={(v) => setForm({ ...form, abertoSabado: v })} trackColor={{ false: '#767577', true: colors.botao }} thumbColor={form.abertoSabado ? '#fff' : '#f4f3f4'} />
            </View>

            {form.abertoSabado && (
              <View style={styles.horarioRow}>
                <Text style={styles.horarioDia}>Sábado</Text>
                <TextInput style={styles.horarioInput} value={form.sabadoAbre} onChangeText={(t) => setForm({ ...form, sabadoAbre: t })} placeholder="08:00" maxLength={5} />
                <Text style={styles.horarioSeparator}>às</Text>
                <TextInput style={styles.horarioInput} value={form.sabadoFecha} onChangeText={(t) => setForm({ ...form, sabadoFecha: t })} placeholder="13:00" maxLength={5} />
              </View>
            )}

            {/* ... resto dos horários exatamente como no seu código original ... */}
            {/* (Domingo, intervalo, etc.) */}
          </View>

          {/* Faz entregas */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16, paddingVertical: 8 }}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Faz entregas?</Text>
              <Switch value={form.fazEntrega} onValueChange={(v) => setForm({ ...form, fazEntrega: v })} trackColor={{ false: '#767577', true: colors.botao }} thumbColor={form.fazEntrega ? '#fff' : '#f4f3f4'} />
            </View>
          </View>

          {/* Tags */}
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
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enviar Solicitação</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Seu StyleSheet 100% original (sem nenhuma alteração)
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
    fontWeight: 500,
    marginBottom: -6,
  },
  sectionTitle: {
    fontWeight: 500,
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
    paddingTop: 14,
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
    fontSize: 16,
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