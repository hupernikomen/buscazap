// App.js
import 'react-native-gesture-handler';

import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './src/pages/home';
import Proposta from './src/pages/proposta';
import InfoPromocao from './src/pages/infoPromocao';


import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native'; 

const Stack = createStackNavigator();

const Tema = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff',
    card: '#00000008',
    suave: '#777',
    primary: '#000',
    border: '#ddd',
    notificacao: '#e2a50cff',
    botao: '#1bc75aff',
    destaque: '#dd8b06ff'
  },
};

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor:'#fff' }}>

      <StatusBar
        style="dark"                    // texto branco (ícones claros)
        translucent={Platform.OS === 'android'} // importante no Android para não sobrepor
      />

      <NavigationContainer theme={Tema}>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: Tema.colors.background
            }
          }}
        >
          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
          <Stack.Screen name="Proposta" component={Proposta} options={{ headerShadowVisible:false, title:'' }} />
          <Stack.Screen name="InfoPromocao" component={InfoPromocao}  options={{ headerShadowVisible:false, title:'' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}