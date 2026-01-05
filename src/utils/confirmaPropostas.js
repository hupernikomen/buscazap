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

export const confirmaPropostas = async () => {
  try {
    const propostasRef = collection(db, 'propostas');
    const consulta = query(propostasRef, where('status', '==', true));
    const snapshot = await getDocs(consulta);

    if (snapshot.empty) {
      console.log('Nenhuma proposta confirmada para processar.');
      return;
    }

    console.log(`${snapshot.size} proposta(s) confirmada(s) encontrada(s). Transferindo para 'users'...`);

    const lote = writeBatch(db);

    snapshot.forEach((docSnap) => {
      const dados = docSnap.data();
      const propostaId = docSnap.id;

      const novoUsuarioRef = doc(db, 'users', propostaId);

      const horariosBase = dados.horarios || {};

      const horarios = {
        semana: {
          abre: horariosBase.semana?.abre?.trim() || '08:00',
          fecha: horariosBase.semana?.fecha?.trim() || '18:00',
        },

        // Só inclui sábado se existir no documento (switch estava ligado)
        ...(horariosBase.sabado && {
          sabado: {
            abre: horariosBase.sabado.abre?.trim() || '08:00',
            fecha: horariosBase.sabado.fecha?.trim() || '13:00',
          },
        }),

        // Só inclui domingo se existir no documento (switch estava ligado)
        ...(horariosBase.domingo && {
          domingo: {
            abre: horariosBase.domingo.abre?.trim() || '09:00',
            fecha: horariosBase.domingo.fecha?.trim() || '13:00',
          },
        }),

        intervalo: {
          global: horariosBase.intervalo?.global === true,
          inicio: horariosBase.intervalo?.inicio?.trim() || '12:00',
          retorno: horariosBase.intervalo?.retorno?.trim() || '13:30',
        },
      };

      const dadosParaSalvar = {
        nome: dados.nome?.trim() || 'Sem nome',
        descricao: dados.descricao?.trim() || '',
        whatsapp: {
          principal: dados.whatsapp?.principal?.trim() || '',
        },
        tags: Array.isArray(dados.tags) ? dados.tags : [],
        fazEntrega: dados.fazEntrega === true,
        bairro: dados.bairro?.trim() || '',
        horarios,
        anuncio: {
          premium: dados.anuncio?.premium || false,
          busca: dados.anuncio?.busca || false,
          postagem: true,
        },
        clicks: 0,
        criadoEm: serverTimestamp(),
      };

      lote.set(novoUsuarioRef, dadosParaSalvar);
      lote.delete(docSnap.ref);
    });

    await lote.commit();
    console.log(`SUCESSO! ${snapshot.size} proposta(s) transferida(s) para 'users'!`);
  } catch (erro) {
    console.error('Erro ao processar propostas confirmadas:', erro);
  }
};