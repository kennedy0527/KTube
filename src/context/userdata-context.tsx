import React, {
  createContext,
  useState,
  useEffect,
  useReducer,
  useMemo,
} from 'react';
import {
  FavoritesType,
  PlaylistItemType,
  PlaylistsStorage,
  handlePlaylists,
  getFavorites,
  getPlaylists,
} from '../utils/usestorage';

export enum Types {
  SET_PLAYLISTS = 'SET_PLAYLISTS',
  UPDATE_PLAYLIST = 'UPDATE_PLAYLIST',
  SET_FAVORITES = 'SET_FAVORITES',
  TOGGLE_VIDEO = 'TOGGLE_VIDEO',

  SET_SORT = 'SET_SORT',
}
type ActionPayload = {
  [Types.SET_FAVORITES]: {
    favorites: FavoritesType;
  };
  [Types.TOGGLE_VIDEO]: {
    video: PlaylistItemType;
  };
  [Types.SET_SORT]: {
    sort: number;
  };
  [Types.SET_PLAYLISTS]: {
    playlists: PlaylistsStorage[];
  };
  [Types.UPDATE_PLAYLIST]: {
    playlist: PlaylistsStorage;
  };
};
type ActionMap<M extends {[index: string]: any}> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
      } & M[Key];
};
type UserDataAction = ActionMap<ActionPayload>[keyof ActionMap<ActionPayload>];
type State = {
  favorites: FavoritesType;
  playlists: PlaylistsStorage[];
};
const reducer = (prevState: State, action: UserDataAction) => {
  switch (action.type) {
    case Types.SET_FAVORITES: {
      return {
        ...prevState,
        favorites: action.favorites,
      };
    }
    case Types.TOGGLE_VIDEO: {
      const videos = prevState.favorites.videos;

      const itemExistIndex = videos.findIndex(
        (video) => video.videoId === action.video.videoId,
      );
      if (itemExistIndex !== -1) {
        videos.splice(itemExistIndex, 1);
      } else {
        videos.push(action.video);
      }
      return {
        ...prevState,
        favorites: {
          ...prevState.favorites,
          videos,
        },
      };
    }
    case Types.SET_SORT: {
      return {
        ...prevState,
        favorites: {
          ...prevState.favorites,
          sort: action.sort,
        },
      };
    }
    case Types.SET_PLAYLISTS: {
      return {
        ...prevState,
        playlists: action.playlists,
      };
    }
    case Types.UPDATE_PLAYLIST: {
      const newPlaylists = handlePlaylists(
        prevState.playlists,
        action.playlist,
      );
      return {
        ...prevState,
        playlists: newPlaylists,
      };
    }
    default: {
      return {
        ...prevState,
      };
    }
  }
};
type UserDataContextProps = {
  favorites: FavoritesType;

  playlists: PlaylistsStorage[];
  dispatch: React.Dispatch<any>;
};
export const UserDataContext = createContext<UserDataContextProps>({
  favorites: {
    videos: [],
    sort: 0,
  },
  playlists: [],
  dispatch: () => null,
});

const {Provider} = UserDataContext;

export default ({children}: {children: React.ReactElement}) => {
  const [state, dispatch] = useReducer(reducer, {
    favorites: {videos: [], sort: 0},
    playlists: [],
  });

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        await getFavoritesFromStorage();
        await getPlaylistsFromStorage();
      } catch (e) {
        console.error(e);
      }
    };

    bootstrapAsync();
  }, []);
  const getFavoritesFromStorage = async () => {
    try {
      const favorites = await getFavorites();
      if (favorites) {
        dispatch({type: Types.SET_FAVORITES, favorites});
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getPlaylistsFromStorage = async () => {
    try {
      const playlists = await getPlaylists();

      if (playlists) {
        dispatch({type: Types.SET_PLAYLISTS, playlists});
      }
    } catch (error) {
      console.log(error);
    }
  };

  const userDataContext = useMemo(
    () => ({
      favorites: state.favorites,
      playlists: state.playlists,
      dispatch,
    }),
    [state],
  );
  return <Provider value={userDataContext}>{children}</Provider>;
};
