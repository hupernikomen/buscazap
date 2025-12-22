// src/utils/menuUtils.js
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebaseConnection/firebase';

/**
 * Escuta em tempo real o menu do Firestore e atualiza o estado automaticamente
 * 
 * @param {Function} setItensMenu - Função setState do useState (ex: setItensMenu)
 * @returns {Function} Função para cancelar o listener (para usar no cleanup)
 */
export const carregarMenuEmTempoReal = (setItensMenu) => {
  // Referência para o documento do menu
  const menuRef = doc(db, 'menu', '1');

  // Inicia o listener em tempo real
  const cancelar = onSnapshot(
    menuRef,
    (snap) => {
      if (snap.exists() && snap.data()?.menu) {
        // Atualiza com os itens do menu
        setItensMenu(snap.data().menu);
      } else {
        // Se não existir ou estiver vazio → array vazio
        setItensMenu([]);
      }
    },
    (erro) => {
      console.error('Erro ao carregar menu:', erro);
      setItensMenu([]); // fallback em caso de erro
    }
  );

  // Retorna a função de cancelamento
  return cancelar;
};