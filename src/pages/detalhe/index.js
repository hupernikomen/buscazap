// src/pages/Detalhe.js

import React, { useState, useEffect } from 'react';
import {
  Text,
  Pressable,
  Linking,
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getHorarioStatus } from '../../utils/carregaHorarios';
import { incrementClicks } from '../../services/firebaseConnection/firestoreService';

import { pedirAvaliacao } from '../../utils/pedirAvaliacao';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function Detalhe({ route, navigation }) {
  const { item, colors } = route.params;

  const [loadingWhatsApp, setLoadingWhatsApp] = useState(false);

  useEffect(() => {

    const registrarAbertura = async () => {
      try {
        const chave = '@contador_detalhe';
        let contador = await AsyncStorage.getItem(chave);
        contador = contador ? parseInt(contador) + 1 : 1;

        await AsyncStorage.setItem(chave, contador.toString());

        if (contador === 5) {
          setTimeout(async () => await pedirAvaliacao(), 1500);
        }
      } catch (error) {}
    };

    registrarAbertura();
  }, [navigation, item.nome]);

  // Agora só usa a estrutura nova com filiais
  const filiais = (item.filiais || []).map(f => ({
    bairro: f.bairro || 'Principal',
    endereco: f.endereco?.trim() || '',
    whatsappNumero: f.whatsapp?.numero || null,
    fazEntrega: f.fazEntrega === true,
    horarios: f.horarios || {}
  }));

  if (filiais.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.nomeLoja, { color: colors.text }]}>{item.nome}</Text>
          <Text style={styles.semInfo}>Informações não disponíveis.</Text>
        </ScrollView>
      </View>
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
      console.error('Erro ao abrir WhatsApp:', error);
      const numeroLimpo = numero.replace(/\D/g, '');
      Linking.openURL(`https://wa.me/55${numeroLimpo}`).catch(() => {});
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

          const tituloFilial = filiais.length > 1
            ? `LOJA ${index + 1} • ${filial.bairro.toUpperCase()}`
            : filial.bairro.toUpperCase();

          return (
            <View key={index} style={styles.filialContainer}>
              <View style={styles.identificacaoContainer}>
                <Text style={[styles.tituloFilial, { color: colors.text }]}>
                  {tituloFilial !== 'TERESINA' ? 'BAIRRO ' : ''}{tituloFilial}
                </Text>

                {temEndereco && (
                    <Text style={styles.enderecoHarmonizadoTexto}>
                      {filial.endereco.toUpperCase()}
                    </Text>
                )}
              </View>


              {estaNoIntervalo && filial.horarios.intervalo?.retorno && (
                <Text style={styles.retornoTexto}>
                  Voltamos às {filial.horarios.intervalo.retorno}
                </Text>
              )}

              <View style={styles.horariosContainer}>
                {filial.horarios.semana && (
                  <View style={styles.linhaHorario}>
                    <Text style={styles.dia}>Seg–Sex</Text>
                    <Text style={styles.horario}>
                      {filial.horarios.semana.abre} – {filial.horarios.semana.fecha}
                    </Text>
                  </View>
                )}

                <View style={styles.linhaHorario}>
                  <Text style={styles.dia}>Sáb</Text>
                  <Text style={temSabado ? styles.horario : styles.horarioFechado}>
                    {temSabado ? `${filial.horarios.sabado.abre} – ${filial.horarios.sabado.fecha}` : 'Fechado'}
                  </Text>
                </View>

                <View style={styles.linhaHorario}>
                  <Text style={styles.dia}>Dom</Text>
                  <Text style={temDomingo ? styles.horario : styles.horarioFechado}>
                    {temDomingo ? `${filial.horarios.domingo.abre} – ${filial.horarios.domingo.fecha}` : 'Fechado'}
                  </Text>
                </View>

                {temIntervalo && filial.horarios.intervalo && (
                  <View style={styles.linhaIntervalo}>
                    <Text style={styles.dia}>Intervalo</Text>
                    <Text style={styles.horario}>
                      {filial.horarios.intervalo.inicio} – {filial.horarios.intervalo.retorno}
                    </Text>
                  </View>
                )}
              </View>

              {filial.fazEntrega && (
                <View style={styles.entregaContainer}>
                  <Ionicons name="bicycle-outline" size={18} color={colors.text} />
                  <Text style={styles.entregaTexto}>Fazemos entregas</Text>
                </View>
              )}

              {filial.whatsappNumero && (
                <Pressable
                  onPress={() => handleWhatsApp(filial.whatsappNumero)}
                  style={[styles.botaoWhats, { backgroundColor: colors.botao }]}
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
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  descricao: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  filialContainer: {
    marginTop: 22,
    backgroundColor: '#fff',
    borderRadius: 42,
    paddingVertical: 20,
    paddingHorizontal: 28,
    marginBottom: 32,
    borderTopWidth: .7,
    borderColor: '#aaa',
  },
  identificacaoContainer: {
    alignItems: 'center',
    marginBottom:22
  },
  tituloFilial: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  enderecoHarmonizadoTexto: {
    fontSize: 14,
    color: '#333',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop:6
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 20,
  },
  statusTexto: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  retornoTexto: {
    fontSize: 15,
    color: '#e67e22',
    textAlign: 'center',
    marginBottom: 28,
    fontStyle: 'italic',
  },
  horariosContainer: {
    borderRadius: 16,
    paddingVertical: 6,
    marginBottom: 12,
    borderColor: '#f0f0f0',
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  linhaHorario: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  linhaIntervalo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginTop: 6,
    borderColor: '#f0f0f0',
    borderTopWidth: 1,
  },
  dia: {
    fontSize: 15,
    color: '#333',
  },
  horario: {
    fontSize: 15,
    color: '#333',
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
    marginBottom: 12,
  },
  entregaTexto: {
    fontSize: 16,
  },
  botaoWhats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    borderRadius: 50,
    height: 55,
    elevation: 5,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});