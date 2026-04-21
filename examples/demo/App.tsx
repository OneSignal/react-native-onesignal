import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import OneSignalLogo from './assets/onesignal_logo.svg';
import AppHeader from './src/components/AppHeader';
import { OneSignalProvider } from './src/hooks/useOneSignal';
import HomeScreen from './src/screens/HomeScreen';
import SecondaryScreen from './src/screens/SecondaryScreen';
import TooltipHelper from './src/services/TooltipHelper';
import { AppColors } from './src/theme';

const Stack = createNativeStackNavigator();

function App() {
  useEffect(() => {
    void TooltipHelper.getInstance().init();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor={AppColors.osPrimary} barStyle="light-content" />
      <OneSignalProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              header: (props) => <AppHeader {...props} />,
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                headerTitle: () => (
                  <View style={headerStyles.container}>
                    <OneSignalLogo height={22} width={99} style={headerStyles.logo} />
                    <Text style={headerStyles.subtitle}>React Native</Text>
                  </View>
                ),
              }}
            />
            <Stack.Screen
              name="Secondary"
              component={SecondaryScreen}
              options={{ title: 'Secondary Activity' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </OneSignalProvider>
      <Toast position="bottom" bottomOffset={20} />
    </SafeAreaProvider>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    marginRight: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: AppColors.white,
  },
});

export default App;
