// src/utils/telefoneUtils.js
export const mascararTelefone = (tel) => {
  const limpo = tel.replace(/\D/g, '');
  if (limpo.length !== 11) return tel;
  const ddd = limpo?.slice(0, 2);
  const inicio = limpo?.slice(2, 3);
  const fim = limpo?.slice(-4);
  return `(${ddd}) ${inicio}...${fim}`;
};