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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Nome da loja */}
        <Text style={[styles.nomeLoja, { color: colors.text }]}>
          {item.nome}
        </Text>

        {/* Descrição geral */}
        {temDescricao && (
          <Text style={styles.descricao}>{item.descricao.trim()}</Text>
        )}

        {/* Cada filial */}
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

          const tituloFilial = filiais.length > 1
            ? `LOJA ${index + 1} • ${filial.bairro.toUpperCase()}`
            : filial.bairro.toUpperCase();

          return (
            <View key={index} style={styles.filialContainer}>
              {/* Bloco título + endereço */}
              <View style={styles.identificacaoContainer}>
                <Text style={[styles.tituloFilial, { color: colors.suave }]}>
                  {tituloFilial}
                </Text>

                {temEndereco && (
                  <View style={styles.enderecoHarmonizado}>
                    {/* <Ionicons name="location-outline" size={16} color={colors.suave} /> */}
                    <Text style={styles.enderecoHarmonizadoTexto}>
                      {filial.endereco.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              {/* Fina linha separadora */}
              <View style={styles.separador} />

              {/* Status da filial */}
              <View style={styles.statusContainer}>
                <Ionicons name={statusIcon} size={18} color={statusCor} />
                <Text style={[styles.statusTexto, { color: statusCor }]}>
                  {statusTexto}
                </Text>
              </View>

              {/* Retorno do intervalo */}
              {estaNoIntervalo && filial.horarios.intervalo?.retorno && (
                <Text style={styles.retornoTexto}>
                  Voltamos às {filial.horarios.intervalo.retorno}
                </Text>
              )}

              {/* Horários detalhados */}
              <View style={styles.horariosContainer}>
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
                  <Text style={styles.entregaTexto}>Fazemos entregas na região</Text>
                </View>
              )}

              {/* Botão WhatsApp */}
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
    paddingBottom: 60,
  },
  nomeLoja: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  descricao: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  filialContainer: {
    backgroundColor: '#fff',
    borderRadius: 32,
    paddingVertical: 28,
    paddingHorizontal: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  identificacaoContainer: {
    alignItems: 'center',
  },
  tituloFilial: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  enderecoHarmonizado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  enderecoHarmonizadoTexto: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    // letterSpacing: 0.8,
    textAlign: 'center',
    lineHeight: 20,
  },
  separador: {
    height: 1,
    width:20,
    alignSelf:'center',
    backgroundColor: '#f0f0f0',
    marginVertical: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  statusTexto: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  retornoTexto: {
    fontSize: 15,
    color: '#e67e22',
    textAlign: 'center',
    marginBottom: 28,
    fontStyle: 'italic',
  },
  horariosContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  linhaHorario: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  linhaHoje: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: -12,
  },
  dia: {
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
  },
  horario: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  horarioFechado: {
    fontSize: 15,
    color: '#999',
    fontStyle: 'italic',
  },
  entregaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    marginBottom: 32,
    backgroundColor: '#f0f8f0',
    borderRadius: 40,
  },
  entregaTexto: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: '600',
  },
  botaoWhats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 12,
    borderRadius: 50,
    backgroundColor: '#25D366',
  },
  textoBotao: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});