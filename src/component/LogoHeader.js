import React from 'react';
import { View, Image } from 'react-native';

const LOGO_URL =
  'https://firebasestorage.googleapis.com/v0/b/appguiacomercial-e6109.appspot.com/o/buscazapthe3.png?alt=media&token=b46ea653-8e79-4b15-afd9-7d958e0096f0';

export default function LogoHeader() {
  return (
    <View style={{ alignItems: 'center', paddingTop: 20 }}>
      <Image
        source={{ uri: LOGO_URL }}
        style={{ width: 160, height: 70 }}
        resizeMode="contain"
      />
    </View>
  );
}