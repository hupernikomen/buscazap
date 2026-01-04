// src/service/firebaseConnection/firestoreService.js

// Importa a instância do Firestore já inicializada e configurada no arquivo firebase.js
import { db } from './firebase';

// Importa funções específicas do SDK do Firestore v9 (modular)
import { 
  collection,     // Cria referência para uma coleção no banco de dados
  query,           // Permite construir consultas complexas
  orderBy,         // Define a ordem dos resultados
  limit,           // Limita a quantidade de documentos retornados
  onSnapshot,      // Assina mudanças em tempo real (listener)
  doc,             // Cria referência para um documento específico
  updateDoc,       // Atualiza campos de um documento
  increment,       // Incrementa um valor numérico de forma atômica (segura para concorrência)
  getDoc,           // Busca os dados de um único documento
  getDocs
} from 'firebase/firestore';

// Define o limite máximo de cliques antes de resetar o contador para zero
// Quando um item atinge 7 cliques, o próximo clique reseta para 0
const MAX_CLIQUES_ANTES_RESET = 7;

// Função assíncrona que incrementa o contador de cliques de uma loja (documento na coleção 'users')
export const incrementClicks = async (itemId) => {
  // Validação básica: garante que o ID do item foi passado
  if (!itemId) {
    console.error('ID do item inválido');
    return;
  }

  // Cria uma referência direta ao documento específico na coleção 'users'
  const userRef = doc(db, 'users', itemId);

  try {
    // Primeiro passo: lê o documento atual para obter o valor corrente de 'clicks'
    const docSnap = await getDoc(userRef);
    
    // Verifica se o documento realmente existe no Firestore
    if (!docSnap.exists()) {
      console.error('Documento não encontrado:', itemId);
      return;
    }

    // Extrai o valor atual do campo 'clicks', default 0 se não existir
    const currentClicks = docSnap.data().clicks || 0;

    // Calcula qual seria o novo valor após o incremento (+1)
    const newClicks = currentClicks + 1;

    // Verifica se o novo valor atingiria ou ultrapassaria o limite definido
    if (newClicks >= MAX_CLIQUES_ANTES_RESET) {
      // Se sim, reseta o contador de cliques para 0
      await updateDoc(userRef, { clicks: 0 });
      console.log(`Cliques resetados para 0 no item ${itemId} (atingiu ${newClicks})`);
    } else {
      // Caso contrário, incrementa normalmente em +1 de forma atômica
      // O uso de increment(1) garante que não haja conflitos em acessos simultâneos
      await updateDoc(userRef, { clicks: increment(1) });
    }
  } catch (error) {
    // Captura e registra qualquer erro (conexão, permissão, etc.)
    console.error('Erro ao incrementar/verificar cliques:', error);
  }
};

// Função que cria uma assinatura em tempo real para os dados das lojas
// Recebe o termo de busca e uma callback que será chamada sempre que houver mudanças
export const subscribeToStores = (searchQuery, callback) => {
  // Normaliza o termo de busca: remove espaços extras e converte para minúsculas
  const searchNormalized = searchQuery.trim().toLowerCase();

  let q; // Variável que armazenará a consulta final ao Firestore

  if (searchNormalized === '') {
    // Quando NÃO há busca ativa:
    // Consulta ordenada por cliques decrescente (mais clicados primeiro)
    // Limitada a 500 documentos para melhorar performance e reduzir custo
    q = query(collection(db, 'users'), orderBy('clicks', 'desc'), limit(500));
  } else {
    // Quando HÁ busca ativa:
    // Não aplica ordenação por cliques (a relevância será calculada no cliente)
    // Busca todos os documentos da coleção (filtragem e ordenação feita no app)
    q = query(collection(db, 'users'));
  }

  // Inicia a escuta em tempo real:
  // - Sempre que houver inserção, atualização ou remoção nos documentos da query
  // - Executa o callback passado (ex: função no HomeScreen que atualiza o estado)
  // - Em caso de erro na escuta, registra no console
  return onSnapshot(q, callback, (error) => {
    console.error('Erro no onSnapshot:', error);
  });
};

export const fetchStoresOnce = async (searchQuery = '') => {
  const searchNormalized = searchQuery.trim().toLowerCase();

  let q;

  if (searchNormalized === '') {
    q = query(collection(db, 'users'), orderBy('clicks', 'desc'), limit(500));
  } else {
    q = query(collection(db, 'users'));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(item => item?.anuncio?.postagem === true);
};