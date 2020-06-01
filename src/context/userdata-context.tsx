import React, {
  createContext,
  useState,
  useEffect,
  useReducer,
  useMemo,
} from 'react';
import useStorage, {FavoritesType, PlaylistItemType} from '../utils/usestorage';
import {act} from 'react-test-renderer';

export enum Types {
  GET_FAVORITES = 'GET_FAVORITES',
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
    default: {
      return {
        ...prevState,
      };
    }
  }
};
type UserDataContextProps = {
  favorites: FavoritesType;
  dispatch: React.Dispatch<any>;
};
export const UserDataContext = createContext<UserDataContextProps>({
  favorites: {
    videos: [],
    sort: 0,
  },
  dispatch: () => null,
});

const {Provider} = UserDataContext;

export default ({children}: {children: React.ReactElement}) => {
  const [state, dispatch] = useReducer(reducer, {
    favorites: {videos: [], sort: 0},
  });
  const {getFavorites, saveFavorites} = useStorage();

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        await getFavoritesFromStorage();
        // const userSetting = await getFavorites();
        // setSortData(userSetting.sort);
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
  // const setSort = (sort: number) => {
  //   setSortData(sort);
  //   // saveUserData({sort});
  // };
  const userDataContext = useMemo(
    () => ({
      favorites: state.favorites,
      dispatch,
    }),
    [state],
  );
  return <Provider value={userDataContext}>{children}</Provider>;
};
