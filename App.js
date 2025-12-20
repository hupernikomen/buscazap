// App.js
import 'react-native-gesture-handler';

import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './src/pages/home';
import Sobre from './src/pages/sobre';

import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native'; 

const Stack = createStackNavigator();

const Tema = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff',
    card: '#fbf9f9ff',
    primary: '#11246fff',
    border: '#ddd',
    black: '#000',
    notification: '#f67f08ff'
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
          <Stack.Screen name="Sobre" component={Sobre} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}