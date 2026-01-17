// src/utils/pedirAvaliacao.js

import * as StoreReview from 'expo-store-review';
import { Platform } from 'react-native';

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