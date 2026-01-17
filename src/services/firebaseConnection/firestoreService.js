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

// Limite máximo de cliques antes de resetar o contador para evitar contagem infinita
const MAX_CLIQUES_ANTES_RESET = 15;

/**
 * Incrementa o contador de cliques de uma loja específica.
 * Regras:
 * - A cada clique, aumenta o campo 'clicks' em +1
 * - Quando atinge 15 cliques, reseta para 0 (evita valores muito altos e permite reordenação natural)
 * - Usa Firestore increment() para operação atômica (segura em múltiplos dispositivos)
 * 
 * @param {string} itemId - ID do documento da loja no Firestore (coleção 'users')
 */
export const incrementClicks = async (itemId) => {
  // Validação básica: se não houver ID, interrompe a função
  if (!itemId) {
    console.warn('incrementClicks chamado sem itemId válido');
    return;
  }

  // Referência ao documento da loja no Firestore
  const userRef = doc(db, 'users', itemId);

  try {
    // Busca o documento atual para ler o valor atual de 'clicks'
    const docSnap = await getDoc(userRef);

    // Se o documento não existir (loja deletada ou ID errado), interrompe
    if (!docSnap.exists()) {
      console.warn(`Documento não encontrado para itemId: ${itemId}`);
      return;
    }

    // Lê o valor atual do campo 'clicks' (padrão 0 se não existir)
    const currentClicks = docSnap.data().clicks || 0;

    // Calcula o novo valor após o clique
    const newClicks = currentClicks + 1;

    if (newClicks >= MAX_CLIQUES_ANTES_RESET) {
      // Reset completo: define clicks = 0
      // Isso permite que lojas muito populares voltem a competir por destaque periodicamente
      await updateDoc(userRef, { clicks: 0 });
      console.log(`Cliques resetados para 0 na loja ${itemId} (atingiu ${MAX_CLIQUES_ANTES_RESET})`);
    } else {
      // Incremento normal: +1 no campo clicks
      // Uso do increment(1) garante operação atômica (evita conflitos em acessos simultâneos)
      await updateDoc(userRef, { clicks: increment(1) });
    }
  } catch (error) {
    // Captura e loga qualquer erro (permissão, rede, etc.)
    console.error('Erro ao incrementar cliques:', error);
  }
};

/**
 * Busca todas as lojas ativas no aplicativo.
 * Critério de "ativa": campo anuncio.postagem === true
 * @returns {Array} Lista de objetos com id e dados de cada loja
 */
export const fetchAllStores = async () => {
  try {
    // Consulta: todas as lojas onde anuncio.postagem é true
    const q = query(
      collection(db, 'users'),
      where('anuncio.postagem', '==', true)
    );

    // Executa a consulta
    const snapshot = await getDocs(q);

    // Mapeia os documentos para objetos com id + dados
    const dados = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return dados;
  } catch (error) {
    console.error('Erro ao carregar todas as lojas:', error);
    return []; // Retorna array vazio em caso de erro para evitar crash no app
  }
};