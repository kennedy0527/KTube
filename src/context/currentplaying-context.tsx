import React, {createContext, useReducer, useMemo, useEffect} from 'react';
import {PlaylistItemType} from '../utils/usestorage';
export enum Types {
  SetVideos = 'SET_VIDEOS',
  PlayerIsReadyChanged = 'PLAYER_IS_READY',
}
type ActionPayload = {
  [Types.SetVideos]: {
    currentPlaying: {
      videoId: string;
      videoUrl: string;
      thumbnailUrl: string;
      title: string;
    };
    videoItems: Array<any>;
  };
  [Types.PlayerIsReadyChanged]: {
    isPlayerReady: boolean;
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
type CurrentPlayingAction = ActionMap<ActionPayload>[keyof ActionMap<
  ActionPayload
>];
type State = {
  isPlayerReady: boolean;
  currentPlaying: {
    videoId: string;
    videoUrl: string;
    thumbnailUrl: string;
    title: string;
  };
  videoItems: PlaylistItemType[];
};
const reducer = (prevState: State, action: CurrentPlayingAction) => {
  switch (action.type) {
    case Types.SetVideos:
      return {
        ...prevState,
        isPlayerReady: false,
        currentPlaying: action.currentPlaying,
        videoItems: action.videoItems,
      };
    case Types.PlayerIsReadyChanged:
      return {
        ...prevState,
        isPlayerReady: action.isPlayerReady,
      };
    default: {
      return {
        ...prevState,
      };
    }
  }
};
type CurrentPlayingContextProps = {
  videoItems: PlaylistItemType[];
  currentPlaying: {
    videoId: string;
    videoUrl: string;
    thumbnailUrl: string;
    title: string;
  };
  isPlayerReady: boolean;
  dispatch: React.Dispatch<any>;
};
export const CurrentPlayingContext = createContext<CurrentPlayingContextProps>({
  isPlayerReady: false,
  currentPlaying: {
    videoId: '',
    videoUrl: '',
    thumbnailUrl: '',
    title: '',
  },
  videoItems: [],
  dispatch: () => null,
});
const {Provider} = CurrentPlayingContext;
export default ({
  children,
  videoItems,
  currentPlaying,
}: {
  children: React.ReactElement;
  videoItems: PlaylistItemType[];
  currentPlaying: {
    videoId: string;
    videoUrl: string;
    thumbnailUrl: string;
    title: string;
  };
}): React.ReactElement => {
  const [state, dispatch] = useReducer(reducer, {
    isPlayerReady: false,
    videoItems,
    currentPlaying,
  });
  useEffect(() => {
    dispatch({type: Types.SetVideos, currentPlaying, videoItems});
  }, [videoItems, currentPlaying]);
  const currentPlayingContext = useMemo(
    () => ({
      videoItems: state.videoItems,
      currentPlaying: state.currentPlaying,
      isPlayerReady: state.isPlayerReady,
      dispatch,
    }),
    [state],
  );
  return <Provider value={currentPlayingContext}>{children}</Provider>;
};
