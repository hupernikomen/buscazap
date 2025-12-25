// src/utils/menuUtils.js
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebaseConnection/firebase';


export const carregarItensMenu = (setItensMenu) => {
  // Referência para o documento do menu
  const menuRef = doc(db, 'menu', '1');

  // Inicia o listener em tempo real
  const itens = onSnapshot(
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
  return itens;
};