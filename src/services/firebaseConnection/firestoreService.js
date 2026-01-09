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
  getDoc,
  getDocs,
  startAfter
} from 'firebase/firestore';

const MAX_CLIQUES_ANTES_RESET = 15;

// ================== CONTROLE CENTRALIZADO DE PAGINAÇÃO ==================
// Altere esses valores quando quiser mudar a quantidade de itens carregados
export const ITENS_INICIAL_HOME = 15;        // Itens na home inicial e em cada "carregar mais" na home
export const ITENS_POR_PAGINA_BUSCA = 5;    // Itens por página na busca

// === FUNÇÕES EXISTENTES ===
export const incrementClicks = async (itemId) => {
  if (!itemId) {
    console.error('ID do item inválido');
    return;
  }

  const userRef = doc(db, 'users', itemId);

  try {
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      console.error('Documento não encontrado:', itemId);
      return;
    }

    const currentClicks = docSnap.data().clicks || 0;
    const newClicks = currentClicks + 1;

    if (newClicks >= MAX_CLIQUES_ANTES_RESET) {
      await updateDoc(userRef, { clicks: 0 });
      console.log(`Cliques resetados para 0 no item ${itemId} (atingiu ${newClicks})`);
    } else {
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
    q = query(collection(db, 'users'), orderBy('clicks', 'desc'), limit(500));
  } else {
    q = query(collection(db, 'users'));
  }

  return onSnapshot(q, callback, (error) => {
    console.error('Erro no onSnapshot:', error);
  });
};

// === FUNÇÃO ÚNICA DE PAGINAÇÃO (home e busca) ===
let ultimoDocumento = null;
let ultimoTermoBusca = '';

export const fetchStoresPaginado = async (searchQuery = '', reset = false) => {
  const searchNormalized = searchQuery.trim().toLowerCase();

  if (reset || searchNormalized !== ultimoTermoBusca) {
    ultimoDocumento = null;
    ultimoTermoBusca = searchNormalized;
  }

  const limite = searchNormalized === '' ? ITENS_INICIAL_HOME : ITENS_POR_PAGINA_BUSCA;

  const usersRef = collection(db, 'users');

  let q = query(usersRef, orderBy('nome'), limit(limite));

  if (ultimoDocumento && !reset) {
    q = query(q, startAfter(ultimoDocumento));
  }

  try {
    const snapshot = await getDocs(q);

    const dadosBrutos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const dados = dadosBrutos.filter(item => item?.anuncio?.postagem === true);

    if (snapshot.docs.length > 0) {
      ultimoDocumento = snapshot.docs[snapshot.docs.length - 1];
    }

    const temMais = snapshot.docs.length === limite;

    return { dados, temMais };
  } catch (error) {
    console.error('Erro na busca paginada:', error);
    return { dados: [], temMais: false };
  }
};