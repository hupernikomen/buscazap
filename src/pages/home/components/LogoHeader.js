import React from 'react';
import { View, Image } from 'react-native';

const LOGO_URL =
  'https://firebasestorage.googleapis.com/v0/b/appguiacomercial-e6109.appspot.com/o/buscazapthe2.png?alt=media&token=8d55bbb0-be1c-487f-b7f3-c65b1bbdc9aa';

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