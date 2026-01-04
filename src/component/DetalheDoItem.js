// src/component/StoreBottomSheet.js
import { Text, Pressable, Linking, View, StyleSheet } from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { getHorarioStatus } from '../utils/carregaHorarios';
import { Ionicons } from '@expo/vector-icons';
import { incrementClicks } from '../services/firebaseConnection/firestoreService';

const hojeIndex = new Date().getDay(); // 0 = Domingo, 6 = Sábado

export const DetalheDoItem = ({ item, colors }) => {
  const horarioStatus = getHorarioStatus(item.horarios);

  const handleWhatsApp = async () => {
    if (!item.premium) await incrementClicks(item.id);
    Linking.openURL(`https://wa.me/${item?.whatsapp?.principal.replace(/\D/g, '')}`);
  };

  const isOpen = horarioStatus.isOpen;
  const isLunchBreak = horarioStatus.emIntervalo;

  // Cores suaves para o status
  const statusColor = isOpen 
    ? '#1A73E8'      // Azul suave (aberto)
    : isLunchBreak 
      ? '#FF9800'   // Laranja suave (em intervalo)
      : '#666666';  // Cinza neutro (fechado)

  const temSabado = !!item.horarios?.sabado;
  const temDomingo = !!item.horarios?.domingo;
  const temIntervalo = item.horarios?.intervalo?.global === true;
  const fazEntrega = item.fazEntrega === true;
  const temDescricao = !!item.descricao?.trim();

  return (
    <BottomSheetView style={styles.container}>
      {/* Cabeçalho: Nome, descrição e status atual */}
      <View style={styles.header}>
        <Text style={[styles.nomeLoja, { color: colors.text }]}>{item?.nome}</Text>

        {/* Descrição (se existir) */}
        {temDescricao && (
          <Text style={styles.descricaoLoja}>{item.descricao.trim()}</Text>
        )}

        {/* Status atual */}
        <View style={styles.statusPrincipal}>
          <Ionicons
            name={isOpen ? 'lock-open-outline' : 'lock-closed-outline'}
            size={16}
            color={statusColor}
          />
          <Text style={[styles.statusTexto, { color: statusColor }]}>
            {horarioStatus.text}
          </Text>
        </View>
      </View>

      {/* Seção de Horários */}
      <View style={styles.secaoHorarios}>
        <Text style={styles.tituloSecao}>Horários de funcionamento</Text>

        {/* Segunda a Sexta */}
        <View style={styles.linhaHorario}>
          <Text style={[
            styles.diaSemana,
            (hojeIndex >= 1 && hojeIndex <= 5) && styles.diaHoje
          ]}>
            Segunda–Sexta
          </Text>
          <Text style={styles.horario}>
            {item.horarios.semana.abre} – {item.horarios.semana.fecha}
          </Text>
        </View>

        {/* Intervalo diário */}
        {temIntervalo && (
          <View style={styles.linhaHorario}>
            <Text style={styles.diaSemana}>Intervalo diário</Text>
            <Text style={styles.horario}>
              {item.horarios.intervalo.inicio} – {item.horarios.intervalo.retorno}
            </Text>
          </View>
        )}

        {/* Sábado */}
        {temSabado && (
          <View style={styles.linhaHorario}>
            <Text style={[styles.diaSemana, hojeIndex === 6 && styles.diaHoje]}>
              Sábado
            </Text>
            <Text style={styles.horario}>
              {item.horarios.sabado.abre} – {item.horarios.sabado.fecha}
            </Text>
          </View>
        )}

        {/* Domingo */}
        {temDomingo && (
          <View style={styles.linhaHorario}>
            <Text style={[styles.diaSemana, hojeIndex === 0 && styles.diaHoje]}>
              Domingo
            </Text>
            <Text style={styles.horario}>
              {item.horarios.domingo.abre} – {item.horarios.domingo.fecha}
            </Text>
          </View>
        )}

        {/* Fim de semana fechado */}
        {!temSabado && !temDomingo && (
          <View style={styles.linhaHorario}>
            <Text style={styles.diaSemana}>Sábado e domingo</Text>
            <Text style={styles.horarioFechado}>Fechado</Text>
          </View>
        )}
      </View>

      {/* Faz entregas (opcional) */}
      {fazEntrega && (
        <View style={styles.secaoExtra}>
          <Ionicons name="bicycle-outline" size={18} color={colors.text} />
          <Text style={styles.textoExtra}>Fazemos entregas</Text>
        </View>
      )}

      {/* Botão WhatsApp simplificado */}
      <Pressable
        onPress={handleWhatsApp}
        style={[styles.botaoWhatsApp, { backgroundColor: colors.botao }]}
      >
        <Ionicons name="logo-whatsapp" size={26} color="#fff" />
        <Text style={styles.textoBotao}>WhatsApp</Text>
      </Pressable>
    </BottomSheetView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  nomeLoja: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  descricaoLoja: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginVertical: 12,
    marginHorizontal: 20,
    lineHeight: 22,
    fontWeight: '400',
  },
  statusPrincipal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
  },
  statusTexto: {
    fontWeight: '800',
    textTransform:'uppercase'
  },
  secaoHorarios: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 24,
  },
  tituloSecao: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  linhaHorario: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  diaSemana: {
    fontSize: 15.5,
    color: '#333',
    fontWeight: '400',
  },
  diaHoje: {
    fontWeight: '600',
    color: '#1bc75aff',
  },
  horario: {
    fontSize: 15.5,
    color: '#000',
    fontWeight: '400',
  },
  horarioFechado: {
    fontSize: 15.5,
    color: '#666666',
    fontWeight: '400',
  },
  secaoExtra: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  textoExtra: {
    fontSize: 15.5,
    color: '#000',
    fontWeight: '400',
  },
  botaoWhatsApp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingVertical: 19,
    borderRadius: 35,
    marginTop: 'auto',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});