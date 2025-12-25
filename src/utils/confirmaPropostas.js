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
 * Processa todas as propostas com status = true:
 * Transfere os dados completos para a coleção 'users' (lojas publicadas)
 * e remove da coleção 'propostas'
 */
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

      // Referência para o novo documento na coleção 'users'
      const novoUsuarioRef = doc(db, 'users', propostaId);

      // Constrói o objeto horarios com base nos dados reais da proposta
      const horarios = {
        // Segunda a sexta (sempre presente)
        semana: {
          abre: dados.horarios?.semana?.abre?.trim() || '08:00',
          fecha: dados.horarios?.semana?.fecha?.trim() || '18:00',
        },
        // Sábado (sempre presente)
        sabado: {
          abre: dados.horarios?.sabado?.abre?.trim() || '08:00',
          fecha: dados.horarios?.sabado?.fecha?.trim() || '13:00',
        },
        // Domingo: só inclui se existir e tiver horários preenchidos
        ...(dados.horarios?.domingo &&
        dados.horarios.domingo.abre &&
        dados.horarios.domingo.fecha
          ? {
              domingo: {
                abre: dados.horarios.domingo.abre.trim(),
                fecha: dados.horarios.domingo.fecha.trim(),
              },
            }
          : { domingo: null }), // ou pode omitir completamente se preferir

        // Intervalo de almoço: usa os valores reais ou padrão se não existir
        intervalo: {
          global: dados.horarios?.intervalo?.global === true,
          inicio: dados.horarios?.intervalo?.inicio?.trim() || '12:00',
          retorno: dados.horarios?.intervalo?.retorno?.trim() || '13:30',
        },
      };

      // Dados finais a serem salvos na coleção 'users'
      const dadosParaSalvar = {
        nome: dados.nome?.trim() || 'Sem nome',
        categoria: '',
        descricao: dados.descricao?.trim() || '',
        endereco: {
          complemento: dados.endereco?.complemento?.trim() || '',
          bairro: dados.endereco?.bairro?.trim() || '',
        },
        whatsapp: {
          principal: dados.whatsapp?.principal?.trim() || '',
        },
        tags: Array.isArray(dados.tags) ? dados.tags : [],
        fazEntrega: dados.fazEntrega === true, // garante boolean correto

        horarios, // objeto completo com todos os horários e intervalo

        anuncio: {
          premium: dados.anuncio?.premium || false,
          busca: dados.anuncio?.busca || false,
          postagem: true,
        },

        clicks: 0,
        criadoEm: serverTimestamp(),
      };

      // Adiciona à coleção 'users'
      lote.set(novoUsuarioRef, dadosParaSalvar);

      // Remove da coleção 'propostas'
      lote.delete(docSnap.ref);
    });

    await lote.commit();
    console.log(`SUCESSO! ${snapshot.size} proposta(s) transferida(s) para 'users' com dados completos e atualizados!`);
  } catch (erro) {
    console.error('Erro ao processar propostas confirmadas:', erro);
  }
};