// src/services/firebaseConnection/firestoreService.js

import { db } from './firebase';
import { 
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  increment,
  getDoc,
} from 'firebase/firestore';

const MAX_CLIQUES_ANTES_RESET = 15;

// Incrementar cliques
export const incrementClicks = async (itemId) => {
  if (!itemId) return;

  const userRef = doc(db, 'users', itemId);

  try {
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) return;

    // CORRIGIDO: campo correto é 'clicks'
    const currentClicks = docSnap.data().clicks || 0;
    const newClicks = currentClicks + 1;

    if (newClicks >= MAX_CLIQUES_ANTES_RESET) {
      // CORRIGIDO: resetando o campo 'clicks'
      await updateDoc(userRef, { clicks: 0 });
      console.log(`Cliques resetados para 0 no item ${itemId}`);
    } else {
      // CORRIGIDO: incrementando o campo 'clicks'
      await updateDoc(userRef, { clicks: increment(1) });
    }
  } catch (error) {
    console.error('Erro ao incrementar cliques:', error);
  }
};

// NOVA FUNÇÃO: traz TODAS as lojas ativas de uma vez
export const fetchAllStores = async () => {
  try {
    const q = query(
      collection(db, 'users'),
      where('anuncio.postagem', '==', true)
    );

    const snapshot = await getDocs(q);
    const dados = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return dados;
  } catch (error) {
    console.error('Erro ao carregar todas as lojas:', error);
    return [];
  }
};