// src/component/StoreBottomSheet.js
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
    if (!item.premium) await incrementClicks(item.id);
    Linking.openURL(`https://wa.me/+55${numero.replace(/\D/g, '')}`);
  };

  // Cálculo do horário atual em minutos
  const agora = new Date();
  const horaAtual = agora.getHours() * 60 + agora.getMinutes();

  const temIntervaloGlobal = item.horarios?.intervalo?.global === true;

  let intervaloInicioMin = 0;
  let intervaloRetornoMin = 0;
  let estaNoIntervalo = false;

  if (temIntervaloGlobal) {
    intervaloInicioMin = parseInt(item.horarios.intervalo.inicio.replace(':', ''));
    intervaloRetornoMin = parseInt(item.horarios.intervalo.retorno.replace(':', ''));
    estaNoIntervalo = horaAtual >= intervaloInicioMin && horaAtual < intervaloRetornoMin;
  }

  // Só considera "no intervalo" se o estabelecimento estaria aberto sem o intervalo
  const estaFechadoParaAlmoco = temIntervaloGlobal && estaNoIntervalo && isOpen;

  const temSabado = !!item.horarios?.sabado;
  const temDomingo = !!item.horarios?.domingo;
  const fazEntrega = item.fazEntrega === true;
  const temDescricao = !!item.descricao?.trim();

  return (
    <BottomSheetView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={[styles.nomeLoja, { color: colors.text }]}>{item?.nome}</Text>

        {temDescricao && (
          <Text style={styles.descricaoLoja}>{item.descricao.trim()}</Text>
        )}
      </View>

      {/* Seção de Horários */}
      <View style={styles.secaoHorarios}>
        {/* Status atual */}
        <View style={styles.statusPrincipal}>
          <Ionicons
            name={isOpen && !estaFechadoParaAlmoco ? 'lock-open-outline' : 'lock-closed-outline'}
            size={16}
            color={isOpen && !estaFechadoParaAlmoco ? '#28a745' : '#999'}
          />
          <Text style={styles.statusTexto}>
            {estaFechadoParaAlmoco ? 'Fechado para almoço' : horarioStatus.text}
          </Text>
        </View>

        {/* Intervalo de almoço — sempre no final */}
        {temIntervaloGlobal && (
          <>
            <View style={styles.linhaIntervalo}>
              <Ionicons name="time-outline" size={16} color="#e67e22" />
              <Text style={styles.textoIntervalo}>
                Intervalo: {item.horarios.intervalo.inicio} – {item.horarios.intervalo.retorno}
              </Text>
            </View>

            {/* Mensagem pequena: "Voltamos às..." apenas se estiver fechado para almoço */}
            {estaFechadoParaAlmoco && (
              <View style={styles.linhaVoltamos}>
                <Text style={styles.textoVoltamos}>
                  Voltamos às {item.horarios.intervalo.retorno}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Segunda a Sexta */}
        <View style={styles.linhaHorario}>
          <Text style={styles.diaSemana}>Segunda–Sexta</Text>
          <Text style={styles.horario}>
            {item.horarios.semana.abre} – {item.horarios.semana.fecha}
          </Text>
        </View>



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

      {/* Faz entregas */}
      {fazEntrega && (
        <View style={styles.secaoExtra}>
          <Ionicons name="bicycle-outline" size={18} color={colors.text} />
          <Text style={styles.textoExtra}>Fazemos entregas</Text>
        </View>
      )}

      {/* Botões WhatsApp - Suporte a múltiplos (filiais) */}
      {Array.isArray(item.whatsapp) && item.whatsapp.length > 0 ? (
        item.whatsapp.map((item, index) => (
          <Pressable
            key={index} // idealmente use um id único se tiver, mas index serve
            onPress={() => handleWhatsApp(item.numero)} // passa apenas o número limpo
            style={[styles.botaoWhatsApp, { backgroundColor: colors.botao }]}
          >
            <Ionicons name="logo-whatsapp" size={26} color="#fff" />
            <Text style={styles.textoBotao}>
              {item.bairro ? `Bairro ${item.bairro}` : 'WhatsApp'}
            </Text>
          </Pressable>
        ))
      ) : (
        // Fallback caso não tenha whatsapp (raro)
        <Text style={{ color: '#666', fontStyle: 'italic' }}>WhatsApp não informado</Text>
      )}
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
  secaoHorarios: {
    backgroundColor: '#f9f9f9',
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 24,
    paddingBottom: 12,
  },
  statusPrincipal: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 22,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusTexto: {
    fontWeight: '500',
    textTransform: 'uppercase',
    color: '#333',
  },
  linhaHorario: {
    flexDirection: 'row',
    paddingHorizontal: 22,
    paddingVertical: 6,
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth * 0.8,
    borderBottomColor: '#e8e8e8',
  },
  diaSemana: {
    fontSize: 15.5,
    color: '#333',
    fontWeight: '400',
  },
  diaHoje: {
    fontWeight: '600',
    color: '#1bc75a',
  },
  horario: {
    fontSize: 15.5,
    color: '#000',
    fontWeight: '400',
  },
  horarioFechado: {
    fontSize: 15.5,
    color: '#888',
    fontWeight: '400',
  },
  linhaIntervalo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff9e6',
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#ffeaa7',
    marginBottom: 12,
  },
  textoIntervalo: {
    fontSize: 14.5,
    color: '#d35400',
    fontWeight: '500',
  },
  linhaVoltamos: {
    paddingHorizontal: 22,
    paddingBottom: 8,
    alignItems: 'center',
  },
  textoVoltamos: {
    fontSize: 13,
    color: '#e67e22',
    fontStyle: 'italic',
    fontWeight: '500',
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
    paddingVertical: 12,
    borderRadius: 35,
    marginTop: 'auto',
    elevation: 6,
    marginBottom:6
  },
  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});