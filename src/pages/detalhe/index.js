// src/pages/Detalhe.js

import React, { useState } from 'react';
import {
  Text,
  Pressable,
  Linking,
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getHorarioStatus } from '../../utils/carregaHorarios';
import { incrementClicks } from '../../services/firebaseConnection/firestoreService';

const hojeIndex = new Date().getDay();

export default function Detalhe({ route }) {
  const { item, colors } = route.params;

  const [loadingWhatsApp, setLoadingWhatsApp] = useState(false);

  // === NORMALIZAÇÃO DAS FILIAIS ===
  let filiais = [];

  if (item.filiais && Array.isArray(item.filiais) && item.filiais.length > 0) {
    filiais = item.filiais.map(f => ({
      bairro: f.bairro || 'Principal',
      endereco: f.endereco?.trim() || '',
      whatsappNumero: f.whatsapp?.numero || null,
      fazEntrega: f.fazEntrega === true,
      horarios: f.horarios || {}
    }));
  } else {
    const numeroAntigo = item.whatsapp?.principal || (Array.isArray(item.whatsapp) ? item.whatsapp[0]?.numero : null);
    if (numeroAntigo) {
      filiais = [{
        bairro: item.bairro || 'Principal',
        endereco: '',
        whatsappNumero: numeroAntigo,
        fazEntrega: item.fazEntrega === true,
        horarios: item.horarios || {}
      }];
    }
  }

  if (filiais.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.nomeLoja, { color: colors.text }]}>{item.nome}</Text>
          <Text style={styles.semInfo}>Informações não disponíveis.</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const handleWhatsApp = async (numero) => {
    setLoadingWhatsApp(true);

    try {
      if (!item.anuncio?.premium) {
        await incrementClicks(item.id);
      }

      const numeroLimpo = numero.replace(/\D/g, '');
      await Linking.openURL(`https://wa.me/55${numeroLimpo}`);
    } catch (error) {
      console.error('Erro ao abrir WhatsApp ou incrementar clique:', error);
      const numeroLimpo = numero.replace(/\D/g, '');
      Linking.openURL(`https://wa.me/55${numeroLimpo}`).catch(() => { });
    } finally {
      setTimeout(() => setLoadingWhatsApp(false), 800);
    }
  };

  const temDescricao = !!item.descricao?.trim();

  const tituloFilial = (filial, index) =>
    filiais.length > 1
      ? `LOJA ${index + 1} • ${filial.bairro.toUpperCase()}`
      : filial.bairro.toUpperCase();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.nomeLoja, { color: colors.text }]}>
          {item.nome}
        </Text>

        {temDescricao && (
          <Text style={styles.descricao}>{item.descricao.trim()}</Text>
        )}

        {filiais.map((filial, index) => {
          const horarioStatus = getHorarioStatus(filial.horarios);
          const isOpen = horarioStatus.isOpen;
          const estaNoIntervalo = horarioStatus.emIntervalo;

          const statusTexto = estaNoIntervalo ? 'Fechado para almoço' : horarioStatus.text;
          const statusCor = estaNoIntervalo ? colors.destaque : isOpen ? colors.botao : colors.suave;
          const statusIcon = estaNoIntervalo ? 'time-outline' : isOpen ? 'lock-open-outline' : 'lock-closed-outline';

          const temSabado = !!filial.horarios.sabado?.abre && !!filial.horarios.sabado?.fecha;
          const temDomingo = !!filial.horarios.domingo?.abre && !!filial.horarios.domingo?.fecha;
          const temIntervalo = filial.horarios.intervalo?.global === true;
          const temEndereco = !!filial.endereco;

          return (
            <View key={index} style={styles.filialContainer}>
              <Text style={[styles.tituloFilial, { color: colors.suave }]}>
                {tituloFilial(filial, index)}
              </Text>



              {estaNoIntervalo && filial.horarios.intervalo?.retorno && (
                <Text style={styles.subTextoFilial}>
                  Voltamos às {filial.horarios.intervalo.retorno}
                </Text>
              )}

              {/* Endereço */}
              {temEndereco && (
                <View style={styles.enderecoBadge}>
                  <Ionicons name="location-outline" size={16} color="#888" />
                  <Text style={styles.textoEnderecoBadge}>{filial.endereco}</Text>
                </View>
              )}

              {/* STATUS INDIVIDUAL DA FILIAL */}
              <View style={styles.statusFilialContainer}>
                <Ionicons name={statusIcon} size={20} color={statusCor} />
                <Text style={[styles.statusFilialTexto, { color: statusCor }]}>
                  {statusTexto}
                </Text>
              </View>

              {/* Horários */}
              <View style={styles.horariosContainer}>
                {/* <Text style={styles.tituloSecao}>Horário de funcionamento</Text> */}

                {temIntervalo && filial.horarios.intervalo && (
                  <View style={styles.linhaHorario}>
                    <Text style={styles.dia}>Intervalo</Text>
                    <Text style={styles.horario}>
                      {filial.horarios.intervalo.inicio} – {filial.horarios.intervalo.retorno}
                    </Text>
                  </View>
                )}

                {filial.horarios.semana && (
                  <View style={styles.linhaHorario}>
                    <Text style={styles.dia}>Segunda a Sexta</Text>
                    <Text style={styles.horario}>
                      {filial.horarios.semana.abre} – {filial.horarios.semana.fecha}
                    </Text>
                  </View>
                )}

                <View style={[styles.linhaHorario, hojeIndex === 6 && styles.linhaHoje]}>
                  <Text style={styles.dia}>Sábado</Text>
                  <Text style={temSabado ? styles.horario : styles.horarioFechado}>
                    {temSabado ? `${filial.horarios.sabado.abre} – ${filial.horarios.sabado.fecha}` : 'Fechado'}
                  </Text>
                </View>

                <View style={[styles.linhaHorario, hojeIndex === 0 && styles.linhaHoje]}>
                  <Text style={styles.dia}>Domingo</Text>
                  <Text style={temDomingo ? styles.horario : styles.horarioFechado}>
                    {temDomingo ? `${filial.horarios.domingo.abre} – ${filial.horarios.domingo.fecha}` : 'Fechado'}
                  </Text>
                </View>
              </View>

              {/* Entrega */}
              {filial.fazEntrega && (
                <View style={styles.entregaContainer}>
                  <Ionicons name="bicycle-outline" size={18} color={colors.botao} />
                  <Text style={styles.textoEntrega}>Fazemos entregas na região</Text>
                </View>
              )}

              {/* WhatsApp */}
              {filial.whatsappNumero && (
                <Pressable
                  onPress={() => handleWhatsApp(filial.whatsappNumero)}
                  style={styles.botaoWhats}
                  disabled={loadingWhatsApp}
                >
                  {loadingWhatsApp ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="logo-whatsapp" size={26} color="#fff" />
                      <Text style={styles.textoBotao}>WhatsApp</Text>
                    </>
                  )}
                </Pressable>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  nomeLoja: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  descricao: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  filialContainer: {
    backgroundColor: '#fff',
    borderRadius: 32,
    paddingVertical: 32,
    paddingHorizontal: 22,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  tituloFilial: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  statusFilialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 16,
  },
  statusFilialTexto: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  subTextoFilial: {
    fontSize: 14,
    color: '#e67e22',
    textAlign: 'left',
    marginBottom: 24,
    marginLeft: 28,
    fontStyle: 'italic',
  },
  enderecoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 32,
    alignSelf: 'flex-start',
  },
  textoEnderecoBadge: {
    fontSize: 15,
    color: '#555',
    flexShrink: 1,
  },
  horariosContainer: {
    marginBottom: 24,
  },
  tituloSecao: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
    marginBottom: 12,
    marginLeft: 2,
  },
  linhaHorario: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  linhaHoje: {
    backgroundColor: '#f0faf0',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  dia: {
    fontSize: 15,
    color: '#666',
  },
  horario: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  horarioFechado: {
    fontSize: 15,
    color: '#aaa',
    fontStyle: 'italic',
  },
  entregaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    marginBottom: 28,
  },
  textoEntrega: {
    fontSize: 15.5,
    color: '#28a745',
    fontWeight: '500',
  },
  botaoWhats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingVertical: 16,
    borderRadius: 50,
    backgroundColor: '#25D366',
  },
  textoBotao: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});