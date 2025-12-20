// src/utils/horarioUtils.js
export const getHorarioStatus = (horarios) => {
  if (!horarios) {
    return { text: 'Horário não informado', isOpen: false };
  }

  const diasSemana = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const agora = new Date();
  const diaIndex = agora.getDay();
  const diaAtual = diasSemana[diaIndex];

  let intervalosHoje = [];

  // DOMINGO
  if (diaAtual === 'sunday' && horarios.sunday) {
    // Se sunday for objeto → transforma em array com 1 item
    intervalosHoje = Array.isArray(horarios.sunday) ? horarios.sunday : [horarios.sunday];
  }
  // SÁBADO
  else if (diaAtual === 'saturday' && horarios.saturday) {
    // Mesmo tratamento: garante que seja array
    intervalosHoje = Array.isArray(horarios.saturday) ? horarios.saturday : [horarios.saturday];
  }
  // SEGUNDA A SEXTA → usa "week"
  else if (horarios.week && Array.isArray(horarios.week)) {
    intervalosHoje = horarios.week;
  }

  // Nenhum horário definido para hoje
  if (intervalosHoje.length === 0) {
    return { text: 'Fechado hoje', isOpen: false };
  }

  const timeToMinutes = (time) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  let estaAberto = false;
  let proximoClose = null;
  let proximoOpen = null;

  for (const intervalo of intervalosHoje) {
    const openMin = timeToMinutes(intervalo.open);
    const closeMin = timeToMinutes(intervalo.close);

    if (minutosAgora >= openMin && minutosAgora < closeMin) {
      estaAberto = true;
      proximoClose = intervalo.close;
      break;
    } else if (minutosAgora < openMin && !proximoOpen) {
      proximoOpen = intervalo.open;
    }
  }

  if (estaAberto && proximoClose) {
    return { text: `Aberto - Fecha às ${proximoClose}`, isOpen: true };
  } else if (proximoOpen) {
    return { text: `Fechado - Abre às ${proximoOpen}`, isOpen: false };
  } else {
    return { text: 'Fechado', isOpen: false };
  }
};