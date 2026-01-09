// src/components/StoreBottomSheet.js
import React from 'react';
import { Text, Pressable, Linking, View, StyleSheet } from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { getHorarioStatus } from '../utils/carregaHorarios';
import { Ionicons } from '@expo/vector-icons';
import { incrementClicks } from '../services/firebaseConnection/firestoreService';

const hojeIndex = new Date().getDay(); // 0 = Domingo, 6 = Sábado

export const DetalheDoItem = ({ item, colors }) => {
  const horarioStatus = getHorarioStatus(item.horarios);
  const isOpen = horarioStatus.isOpen;

  const handleWhatsApp = async (numero) => {
    if (!item.anuncio?.premium) await incrementClicks(item.id);
    const numeroLimpo = numero.replace(/\D/g, '');
    Linking.openURL(`https://wa.me/55${numeroLimpo}`);
  };

  // Configurações auxiliares
  const temSabado = !!item.horarios?.sabado;
  const temDomingo = !!item.horarios?.domingo;
  const temIntervalo = item.horarios?.intervalo?.global === true;
  const fazEntrega = item.fazEntrega === true;
  const temDescricao = !!item.descricao?.trim();

  // Verifica se sábado/domingo estão realmente configurados (não só existentes)
  const sabadoAberto = temSabado && item.horarios.sabado?.abre && item.horarios.sabado?.fecha;
  const domingoAberto = temDomingo && item.horarios.domingo?.abre && item.horarios.domingo?.fecha;

  // Status atual considerando intervalo de almoço
  const estaNoIntervalo = horarioStatus.emIntervalo;
  const statusTexto = estaNoIntervalo ? 'Fechado para almoço' : horarioStatus.text;

  const statusCor = estaNoIntervalo
    ? '#e67e22'
    : isOpen && !estaNoIntervalo
      ? '#28a745'
      : '#999';

  const statusIcon = estaNoIntervalo
    ? 'time-outline'
    : isOpen && !estaNoIntervalo
      ? 'lock-open-outline'
      : 'lock-closed-outline';

  return (
    <BottomSheetView style={styles.container}>
      {/* Nome da loja */}
      <Text style={[styles.nomeLoja, { color: colors.text }]}>
        {item.nome}
      </Text>

      {/* Descrição */}
      {temDescricao && (
        <Text style={styles.descricao}>{item.descricao.trim()}</Text>
      )}

      {/* Card de Status Atual */}
      <View style={styles.cardStatus}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.statusTexto, { color: statusCor }]}>
            {statusTexto}
          </Text>
          {estaNoIntervalo && (
            <Text style={styles.subTexto}>
              Voltamos às {item.horarios.intervalo.retorno}
            </Text>
          )}
        </View>
      </View>

      {/* Horários detalhados */}
      <View style={styles.cardHorarios}>
        <Text style={styles.tituloSecao}>Horário de funcionamento</Text>

        {/* Intervalo de almoço */}
        {temIntervalo && (
          <View style={styles.linhaIntervalo}>
            {/* <Ionicons name="time-outline" size={18} color="#e67e22" /> */}
            <Text style={styles.textoIntervalo}>
              Intervalo: {item.horarios.intervalo.inicio} – {item.horarios.intervalo.retorno}
            </Text>
          </View>
        )}

        {/* Segunda a Sexta */}
        <View style={styles.linhaHorario}>
          <Text style={styles.dia}>Segunda a Sexta</Text>
          <Text style={styles.horario}>
            {item.horarios.semana.abre} – {item.horarios.semana.fecha}
          </Text>
        </View>

        {/* Lógica inteligente para fim de semana */}
        {(() => {
          // Caso 1: Ambos fechados → linha única agrupada
          if (!sabadoAberto && !domingoAberto) {
            return (
              <View style={styles.linhaHorario}>
                <Text style={styles.dia}>Sábado e Domingo</Text>
                <Text style={styles.horarioFechado}>Fechado</Text>
              </View>
            );
          }

          // Caso 2: Só sábado aberto
          if (sabadoAberto && !domingoAberto) {
            return (
              <>
                <View style={[styles.linhaHorario, hojeIndex === 6 && styles.linhaHoje]}>
                  <Text style={[styles.dia, hojeIndex === 6 && styles.diaHoje]}>Sábado</Text>
                  <Text style={styles.horario}>
                    {item.horarios.sabado.abre} – {item.horarios.sabado.fecha}
                  </Text>
                </View>
                <View style={styles.linhaHorario}>
                  <Text style={styles.dia}>Domingo</Text>
                  <Text style={styles.horarioFechado}>Fechado</Text>
                </View>
              </>
            );
          }

          // Caso 3: Só domingo aberto
          if (!sabadoAberto && domingoAberto) {
            return (
              <>
                <View style={styles.linhaHorario}>
                  <Text style={styles.dia}>Sábado</Text>
                  <Text style={styles.horarioFechado}>Fechado</Text>
                </View>
                <View style={[styles.linhaHorario, hojeIndex === 0 && styles.linhaHoje]}>
                  <Text style={[styles.dia, hojeIndex === 0 && styles.diaHoje]}>Domingo</Text>
                  <Text style={styles.horario}>
                    {item.horarios.domingo.abre} – {item.horarios.domingo.fecha}
                  </Text>
                </View>
              </>
            );
          }

          // Caso 4: Ambos abertos
          return (
            <>
              <View style={[styles.linhaHorario, hojeIndex === 6 && styles.linhaHoje]}>
                <Text style={[styles.dia, hojeIndex === 6 && styles.diaHoje]}>Sábado</Text>
                <Text style={styles.horario}>
                  {item.horarios.sabado.abre} – {item.horarios.sabado.fecha}
                </Text>
              </View>
              <View style={[styles.linhaHorario, hojeIndex === 0 && styles.linhaHoje]}>
                <Text style={[styles.dia, hojeIndex === 0 && styles.diaHoje]}>Domingo</Text>
                <Text style={styles.horario}>
                  {item.horarios.domingo.abre} – {item.horarios.domingo.fecha}
                </Text>
              </View>
            </>
          );
        })()}
      </View>

      {/* Faz entrega */}
      {fazEntrega && (
        <View style={styles.secaoEntrega}>
          <Ionicons name="bicycle-outline" size={20} color="#28a745" />
          <Text style={styles.textoEntrega}>Fazemos entregas na sua região</Text>
        </View>
      )}

      {/* Botões WhatsApp */}
      <View style={styles.botoesContainer}>
        {Array.isArray(item.whatsapp) && item.whatsapp.length > 0 ? (
          item.whatsapp.map((wp, index) => (
            <Pressable
              key={index}
              onPress={() => handleWhatsApp(wp.numero)}
              style={[styles.botaoWhats, { backgroundColor: '#25D366' }]}
            >
              <Ionicons name="logo-whatsapp" size={26} color="#fff" />
              <Text style={styles.textoBotao}>
                {wp.bairro ? `WhatsApp • ${wp.bairro}` : 'Falar no WhatsApp'}
              </Text>
            </Pressable>
          ))
        ) : (
          <Text style={styles.semWhats}>WhatsApp não informado</Text>
        )}
      </View>
    </BottomSheetView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  nomeLoja: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  descricao: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 10,

  },
  cardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    marginTop: 20,

  },
  statusTexto: {
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  subTexto: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  cardHorarios: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 12,
    marginBottom: 20,
    borderTopWidth: .5,
    borderTopColor: '#aaa',
    borderBottomWidth: .5,
    borderBottomColor: '#aaa'

  },
  tituloSecao: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  linhaHorario: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  horario: {
    color: '#000',
  },
  horarioFechado: {
    color: '#999',
    fontStyle: 'italic',
  },
  linhaIntervalo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f5f3ed7d',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  textoIntervalo: {
    fontSize: 14.5,
  },
  secaoEntrega: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    backgroundColor: '#f0f4f090',
    borderRadius: 32,
    marginBottom: 24,
  },
  textoEntrega: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: '600',
  },
  botoesContainer: {
    gap: 12,
  },
  botaoWhats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingVertical: 16,
    borderRadius: 50,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  semWhats: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    fontSize: 15,
  },
});