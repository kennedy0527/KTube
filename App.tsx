/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the UI Kitten TypeScript template
 * https://github.com/akveo/react-native-ui-kitten
 *
 * Documentation: https://akveo.github.io/react-native-ui-kitten/docs
 *
 * @format
 */
import 'react-native-gesture-handler';
import React, {useEffect} from 'react';
import {IconRegistry} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import AuthProvider from './src/context/auth-context';
import SplashScreen from 'react-native-splash-screen';
import {AppNavigator} from './src/navigation/navigation';
import {SimpleLineIconsPack} from './src/components/iconpack';
import ThemeContextProvider from './src/context/theme-context';
import UserDataContextProvider from './src/context/userdata-context';
import CurrentplayingViewProvider from './src/context/currentplayingview-context';
export default (): React.ReactFragment => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <>
      <IconRegistry icons={[EvaIconsPack, SimpleLineIconsPack]} />
      <ThemeContextProvider>
        <UserDataContextProvider>
          <AuthProvider>
            <CurrentplayingViewProvider>
              <AppNavigator />
            </CurrentplayingViewProvider>
          </AuthProvider>
        </UserDataContextProvider>
      </ThemeContextProvider>
    </>
  );
};
