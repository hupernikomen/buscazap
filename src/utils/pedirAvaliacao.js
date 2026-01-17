// src/utils/pedirAvaliacao.js

import * as StoreReview from 'expo-store-review';

// PEDIR AVALIAÇÃO DOS USUARIOS NO GOOGLE PLAY
export async function pedirAvaliacao() {
  try {
    // Verifica se o módulo está disponível (só em builds nativas)
    if (await StoreReview.isAvailableAsync()) {
      await StoreReview.requestReview();
    } else {
      console.log('StoreReview não disponível (provavelmente Expo Go)');
    }
  } catch (error) {
    console.log('Erro ao pedir avaliação:', error);
  }
}