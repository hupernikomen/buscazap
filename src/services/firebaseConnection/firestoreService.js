// src/service/firebaseConnection/firestoreService.js
import { db } from './firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  doc, 
  updateDoc, 
  increment,
  getDoc 
} from 'firebase/firestore';

// Limite para resetar os cliques
const MAX_CLIQUES_ANTES_RESET = 30;

export const incrementClicks = async (itemId) => {
  if (!itemId) {
    console.error('ID do item inválido');
    return;
  }

  const userRef = doc(db, 'users', itemId);

  try {
    // Primeiro: obtemos o valor atual de clicks
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      console.error('Documento não encontrado:', itemId);
      return;
    }

    const currentClicks = docSnap.data().clicks || 0;
    const newClicks = currentClicks + 1;

    // Se atingir ou ultrapassar o limite, vamos resetar para 0
    if (newClicks >= MAX_CLIQUES_ANTES_RESET) {
      await updateDoc(userRef, { clicks: 0 });
      console.log(`Cliques resetados para 0 no item ${itemId} (atingiu ${newClicks})`);
    } else {
      // Caso contrário, apenas incrementa normalmente
      await updateDoc(userRef, { clicks: increment(1) });
    }
  } catch (error) {
    console.error('Erro ao incrementar/verificar cliques:', error);
  }
};

export const subscribeToStores = (searchQuery, callback) => {
  const searchNormalized = searchQuery.trim().toLowerCase();

  let q;
  if (searchNormalized === '') {
    // Ordena por cliques decrescente e limita para performance
    q = query(collection(db, 'users'), orderBy('clicks', 'desc'), limit(300));
  } else {
    // Quando há busca, não ordenamos por cliques (pois a ordenação é feita no cliente)
    q = query(collection(db, 'users'));
  }

  return onSnapshot(q, callback, (error) => {
    console.error('Erro no onSnapshot:', error);
  });
};