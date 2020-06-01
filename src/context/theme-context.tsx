import React, {createContext, useState, useEffect} from 'react';
import {StatusBar} from 'react-native';
import {ApplicationProvider} from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import Icons from 'react-native-alternate-icons';
import useStorage from '../utils/usestorage';

interface ThemeProps {
  [key: string]: {
    [x: string]: string;
  };
}
const themes: ThemeProps = {
  light: {...eva.light, 'border-favorite-color': '#E4E9F2'},
  dark: {
    ...eva.dark,
    'background-basic-color-1': '#132132',
    'background-basic-color-2': '#1d334d',
    'border-basic-color-4': '#1d334d',
    'border-favorite-color': '#434E5E',
    'color-basic-default': '#578ccc',
  },
};
type ThemeContextProps = {
  theme: string;
  toggleTheme: () => void;
};
export const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  toggleTheme: () => {},
});

const {Provider} = ThemeContext;
export default ({
  children,
}: {
  children: React.ReactElement;
}): React.ReactElement => {
  const {getTheme, saveTheme} = useStorage();
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const theme = await getTheme();
        setTheme(theme);
        if (theme === 'light') {
          StatusBar.setBarStyle('dark-content', true);
        } else {
          StatusBar.setBarStyle('light-content', true);
        }
      } catch (e) {
        console.error(e);
      }
    };

    bootstrapAsync();
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    if (nextTheme === 'light') {
      Icons.reset();
      StatusBar.setBarStyle('dark-content', true);
    } else {
      Icons.setIconName('DarkIcon');
      StatusBar.setBarStyle('light-content', true);
    }
    setTheme(nextTheme);
    saveTheme(nextTheme);
  };
  return (
    <Provider
      value={{
        theme,
        toggleTheme,
      }}>
      <ApplicationProvider {...eva} theme={themes[theme]}>
        {children}
      </ApplicationProvider>
    </Provider>
  );
};
