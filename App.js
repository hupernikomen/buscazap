// App.js
import 'react-native-gesture-handler';

import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './src/pages/home';

import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native'; 

const Stack = createStackNavigator();

const Tema = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff',
    card: '#00000006',
    suave: '#777',
    primary: '#11246fff',
    border: '#ddd',
    black: '#000',
    notification: '#be8b09ff'
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
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}