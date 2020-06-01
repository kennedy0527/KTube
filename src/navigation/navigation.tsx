import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from '../screen/home';
import VideosScreen from '../screen/videos';
import FavoritesScreen from '../screen/favorites';
import PlaylistsScreen from '../screen/playlists';
import CurrentplayingView from '../components/currentplayingview';
import ErrorModal from '../components/errormodal';
import {PlaylistItemType, FavoritesType} from '../utils/usestorage';
export type RootStackParamList = {
  Home: undefined;
  Videos: {
    playlistId: string;
    title: string;
    thumbnail: string;
    dateTime: Date | string;
  };
  Favorites: undefined;
  Playlists: undefined;
};
const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = (): React.ReactElement => {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator headerMode="none">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Videos" component={VideosScreen} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} />
          <Stack.Screen name="Playlists" component={PlaylistsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <ErrorModal />
      <CurrentplayingView />
    </>
  );
};
