// src/component/LogoHeader.js

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LogoHeader() {
  const [textoDigitado, setTextoDigitado] = useState('');
  const [mostrarTeresina, setMostrarTeresina] = useState(false);
  const hasRun = useRef(false); // ← Controla se a animação já rodou

  const textoCompleto = 'Busca Zap';

  useEffect(() => {
    // Executa apenas na primeira montagem
    if (hasRun.current) return;
    hasRun.current = true;

    let index = 0;
    const intervalo = setInterval(() => {
      if (index <= textoCompleto.length) {
        setTextoDigitado(textoCompleto.slice(0, index));
        index++;
      } else {
        clearInterval(intervalo);
        // Mostra TERESINA após delay
        setTimeout(() => {
          setMostrarTeresina(true);
        }, 400);
      }
    }, 80);

    return () => clearInterval(intervalo);
  }, []);

  // Separa "Busca " do "Zap"
  const parteBusca = textoDigitado.replace('Zap', '').trimEnd();
  const temZap = textoDigitado.endsWith('Zap');

  return (
    <View style={styles.container}>
      <Text style={styles.buscaZap}>
        <Text>{parteBusca}</Text>
        {temZap && <Text style={styles.zap}>Zap</Text>}
      </Text>

      {mostrarTeresina && (
        <Text style={styles.teresina}>TERESINA</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 22,
    height:80
  },
  buscaZap: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  zap: {
    fontWeight: '900',
  },
  teresina: {
    fontSize: 10,
    color: '#000',
    letterSpacing: 3,
  },
});