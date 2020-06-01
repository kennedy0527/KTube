import AsyncStorage from '@react-native-community/async-storage';

export type PlaylistItemType = {
  videoId: string;
  title: string;
  videoTimeLength: string;
  thumbnailUrl: string;
};
export type PlaylistsStorage = {
  id: string;
  title: string;
  thumbnail: string;
  playlistItems: Array<PlaylistItemType>;
  dateTime?: Date;
  sort?: number;
};
export type FavoritesType = {
  videos: PlaylistItemType[];
  sort: number;
};
/**
 * Handle Playlists data
 * @param {PlaylistsStorage[]} oldPlaylists - old playlists data
 * @param {PlaylistItemType} playlist - playlist to save to storage
 * @returns new playlists
 */
const handlePlaylists = (
  oldPlaylists: PlaylistsStorage[],
  playlist: PlaylistsStorage,
) => {
  const index = oldPlaylists.findIndex((op) => op.id === playlist.id);
  const newPlaylists = [...oldPlaylists];
  if (index === -1) {
    newPlaylists.push({
      ...playlist,
      dateTime: new Date(),
    });
  } else {
    newPlaylists.splice(index, 1);
    newPlaylists.push({
      ...playlist,
      dateTime: new Date(),
    });
  }
  return newPlaylists;
};

const saveCurrentUserInfo = async (userInfo: any) => {
  try {
    await AsyncStorage.setItem('currentUserInfo', JSON.stringify(userInfo));
  } catch (error) {
    console.log(error);
  }
};
/**
 * Save playlist to storage
 * @param {PlaylistsStorage} playlist - Playlist
 * @param {string} playlist.id - Playlist ID
 * @param {string} playlist.title - Playlist title
 * @param {string} playlist.thumbnail - Playlist thumbnail url
 * @param {PlaylistItemType[]} playlist.playlistItems - Playlist videos
 * @param {number} playlist.sort - Playlist sort (TODO:)
 */
const savePlaylist = async ({
  id,
  title,
  thumbnail,
  playlistItems,
  sort = 0,
}: PlaylistsStorage) => {
  try {
    const importedPlaylist = await AsyncStorage.getItem('importedPlaylist');
    if (importedPlaylist) {
      const oldPlaylists: [PlaylistsStorage] = JSON.parse(importedPlaylist);
      const newPlaylists = handlePlaylists(oldPlaylists, {
        id,
        title,
        thumbnail,
        playlistItems,
        sort,
      });
      await AsyncStorage.setItem(
        'importedPlaylist',
        JSON.stringify(newPlaylists),
      );
    } else {
      const newPlaylists = [
        {
          id,
          title,
          thumbnail,
          playlistItems,
          sort,
          dateTime: new Date(),
        },
      ];
      await AsyncStorage.setItem(
        'importedPlaylist',
        JSON.stringify(newPlaylists),
      );
      console.log('Saved!!');
    }
  } catch (error) {
    console.log(error);
  }
};

/**
 * Get Playlists from storage
 * @returns {PlaylistsStorage} Playlists
 */
const getPlaylists = async (): Promise<PlaylistsStorage[]> => {
  try {
    const importedPlaylist = await AsyncStorage.getItem('importedPlaylist');
    if (importedPlaylist) {
      return JSON.parse(importedPlaylist);
    }
    return [];
  } catch (error) {
    console.log(error);
    return [];
  }
};
const removePlaylist = async (playlistId: string) => {
  try {
    const importedPlaylist = await AsyncStorage.getItem('importedPlaylist');
    if (importedPlaylist) {
      const playlists: [PlaylistsStorage] = JSON.parse(importedPlaylist);
      const removePlaylistIndex = playlists
        .map((playlist: PlaylistsStorage) => playlist.id)
        .indexOf(playlistId);
      if (removePlaylistIndex !== -1) {
        playlists.splice(removePlaylistIndex, 1);
        await AsyncStorage.setItem(
          'importedPlaylist',
          JSON.stringify(playlists),
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
};
const getTheme = async () => {
  try {
    const theme = await AsyncStorage.getItem('theme');
    if (theme) {
      return theme;
    }
    return 'light';
  } catch (error) {
    console.log(error);
    return 'light';
  }
};
const saveTheme = async (theme: string) => {
  try {
    await AsyncStorage.setItem('theme', theme);
  } catch (error) {
    console.log(error);
  }
};
const getUserSetting = async () => {
  try {
    const userSetting = await AsyncStorage.getItem('userSetting');
    if (userSetting) {
      return JSON.parse(userSetting);
    }
    return {
      theme: 'light',
      sort: 0,
    };
  } catch (error) {
    console.log(error);
    return {
      theme: 'light',
      sort: 0,
    };
  }
};
const saveUserSetting = async (userSetting: {theme: string; sort: number}) => {
  try {
    await AsyncStorage.setItem('userSetting', JSON.stringify(userSetting));
  } catch (error) {
    console.log(error);
  }
};
const getFavorites = async (): Promise<FavoritesType | undefined> => {
  try {
    const favorites = await AsyncStorage.getItem('favorites');
    if (favorites) {
      return JSON.parse(favorites);
    }
    return undefined;
  } catch (error) {
    console.log(error);
  }
};
const saveFavorites = async (favorites: PlaylistItemType[], sort: number) => {
  try {
    await AsyncStorage.setItem(
      'favorites',
      JSON.stringify({videos: favorites, sort}),
    );
  } catch (error) {
    console.log(error);
  }
};
const saveToFavorites = async (item: PlaylistItemType) => {
  try {
    const favorites = await AsyncStorage.getItem('favorites');
    if (favorites) {
      const oldFavorites: FavoritesType = JSON.parse(favorites);
      const oldVideos = oldFavorites.videos || [];
      const itemExistIndex = oldVideos.findIndex(
        (video) => video.videoId === item.videoId,
      );
      if (itemExistIndex !== -1) {
        oldVideos.splice(itemExistIndex, 1);
      } else {
        oldVideos.push(item);
      }
      await AsyncStorage.setItem(
        'favorites',
        JSON.stringify({
          videos: oldVideos,
          sort: oldFavorites.sort,
        }),
      );
    } else {
      await AsyncStorage.setItem(
        'favorites',
        JSON.stringify({videos: [item], sort: 0}),
      );
    }
  } catch (error) {
    console.log(error);
  }
};
export {
  saveCurrentUserInfo,
  getPlaylists,
  handlePlaylists,
  savePlaylist,
  removePlaylist,
  getTheme,
  saveTheme,
  getUserSetting,
  saveUserSetting,
  getFavorites,
  saveFavorites,
  saveToFavorites,
};
