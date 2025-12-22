// src/utils/horarioUtils.js
export const getHorarioStatus = (horarios) => {
  if (!horarios) {
    return { text: 'Horário não informado', isOpen: false };
  }

  const agora = new Date();
  const diaIndex = agora.getDay(); // 0=domingo, 1=segunda, ..., 6=sábado
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

  const diasPortugues = {
    0: 'domingo',
    1: 'segunda',
    2: 'terca',
    3: 'quarta',
    4: 'quinta',
    5: 'sexta',
    6: 'sabado',
  };

  const diaAtual = diasPortugues[diaIndex];
  let configHoje = horarios[diaAtual];

  // Fallback para dias úteis (segunda a sexta)
  if (!configHoje && diaIndex >= 1 && diaIndex <= 5) {
    configHoje = horarios.segunda;
  }

  if (!configHoje || !configHoje.abre || !configHoje.fecha) {
    return { text: 'Fechado hoje', isOpen: false };
  }

  const timeToMinutes = (time) => {
    if (!time) return null;
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const abreMin = timeToMinutes(configHoje.abre);
  const fechaMin = timeToMinutes(configHoje.fecha);

  // INTERVALO GLOBAL DE ALMOÇO
  if (horarios.intervalo?.global === true) {
    const inicioAlmoco = timeToMinutes(horarios.intervalo.inicio);
    const retornoAlmoco = timeToMinutes(horarios.intervalo.retorno);

    if (inicioAlmoco !== null && retornoAlmoco !== null) {
      if (minutosAgora >= inicioAlmoco && minutosAgora < retornoAlmoco) {
        return {
          text: 'Fechado para almoço',
          isOpen: false,
          emIntervalo: true, // ESSA LINHA É OBRIGATÓRIA!
        };
      }
    }
  }

  const estaAberto = minutosAgora >= abreMin && minutosAgora < fechaMin;

  if (estaAberto) {
    return { text: `Aberto - Fecha às ${configHoje.fecha}`, isOpen: true };
  } else if (minutosAgora < abreMin) {
    return { text: `Fechado - Abre às ${configHoje.abre}`, isOpen: false };
  } else {
    return { text: 'Fechado', isOpen: false };
  }
};