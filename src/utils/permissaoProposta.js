// src/utils/propostaUtils.js
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../services/firebaseConnection/firebase';

/**
 * Processa todas as propostas confirmadas (status === true)
 * Move para a coleção 'users' com o padrão CORRETO do app
 * Remove da coleção 'propostas'
 */
export const processarPropostasConfirmadas = async () => {
  try {
    const propostasRef = collection(db, 'propostas');
    const consulta = query(propostasRef, where('status', '==', true));
    const snapshot = await getDocs(consulta);

    if (snapshot.empty) {
      console.log('Nenhuma proposta confirmada para processar.');
      return;
    }

    console.log(`${snapshot.size} proposta(s) confirmada(s) encontrada(s). Transferindo...`);

    const lote = writeBatch(db);

    snapshot.forEach((docSnap) => {
      const dados = docSnap.data();
      const novoUsuarioRef = doc(db, 'users', docSnap.id);

      lote.set(novoUsuarioRef, {
        nome: dados.nome?.trim() || 'Sem nome',
        categoria: dados.categoria?.trim() || 'Não informada',
        descricao: dados.descricao?.trim() || '',
        endereco: dados.endereco || { bairro: '', complemento: '' },
        whatsapp: dados.whatsapp || { principal: '' },
        tags: dados.tags || [],

        // HORÁRIOS CORRETOS: tudo dentro do objeto 'horarios'
        horarios: {
          segunda: { abre: '08:00', fecha: '18:00' },
          terca:   { abre: '08:00', fecha: '18:00' },
          quarta:  { abre: '08:00', fecha: '18:00' },
          quinta:  { abre: '08:00', fecha: '18:00' },
          sexta:   { abre: '08:00', fecha: '18:00' },
          sabado:  { abre: '08:00', fecha: '12:00' },
          domingo: { abre: '',      fecha: ''       },

          // Intervalo global de almoço (desativado por padrão)
          intervalo: {
            global: false,
            inicio: '12:00',
            retorno: '14:00'
          }
        },

        // Configuração do anúncio
        anuncio: {
          premium: false,
          busca: false,
          postagem: true,
        },

        clicks: 0,
        criadoEm: serverTimestamp(),
      });

      // Remove da coleção 'propostas'
      lote.delete(docSnap.ref);
    });

    await lote.commit();
    console.log(`SUCESSO! ${snapshot.size} proposta(s) transferidas com o padrão correto!`);
  } catch (erro) {
    console.error('Erro ao processar propostas:', erro);
  }
};