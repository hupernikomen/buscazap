// src/utils/horarioUtils.js

export const getHorarioStatus = (horarios) => {
  if (!horarios) {
    return { text: 'Horário não informado', isOpen: false };
  }

  const agora = new Date();
  const diaIndex = agora.getDay(); // 0 = domingo, 1 = segunda, ..., 6 = sábado
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

  // Determina qual configuração usar com base no dia da semana
  let configHoje;

  if (diaIndex === 0) {
    // Domingo
    configHoje = horarios.domingo;
  } else if (diaIndex === 6) {
    // Sábado
    configHoje = horarios.sabado;
  } else {
    // Segunda a sexta → usa o campo 'semana'
    configHoje = horarios.semana;
  }

  // Se não houver configuração para o dia atual (ou 'semana' não definida)
  if (!configHoje || !configHoje.abre || !configHoje.fecha) {
    return { text: 'Fechado hoje', isOpen: false };
  }

  const timeToMinutes = (time) => {
    if (!time || typeof time !== 'string') return null;
    const [h, m = 0] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const abreMin = timeToMinutes(configHoje.abre);
  const fechaMin = timeToMinutes(configHoje.fecha);

  if (abreMin === null || fechaMin === null) {
    return { text: 'Horário inválido', isOpen: false };
  }

  // INTERVALO GLOBAL DE ALMOÇO (se configurado)
  if (horarios.intervalo?.global === true) {
    const inicioAlmoco = timeToMinutes(horarios.intervalo.inicio);
    const retornoAlmoco = timeToMinutes(horarios.intervalo.retorno);

    if (inicioAlmoco !== null && retornoAlmoco !== null) {
      if (minutosAgora >= inicioAlmoco && minutosAgora < retornoAlmoco) {
        return {
          text: 'Fechado para almoço',
          isOpen: false,
          emIntervalo: true, // Campo obrigatório mantido
        };
      }
    }
  }

  // Verifica se está aberto no horário normal
  const estaAberto = minutosAgora >= abreMin && minutosAgora < fechaMin;

  if (estaAberto) {
    return {
      text: `Aberto - Fecha às ${configHoje.fecha}`,
      isOpen: true,
    };
  } else if (minutosAgora < abreMin) {
    return {
      text: `Fechado - Abre às ${configHoje.abre}`,
      isOpen: false,
    };
  } else {
    return {
      text: 'Fechado',
      isOpen: false,
    };
  }
};