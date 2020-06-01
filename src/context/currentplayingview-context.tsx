import React, {createContext, useMemo, useReducer} from 'react';

export enum Types {
  Show = 'SHOW',
  Hide = 'HIDE',
  ChangeVideo = 'CHANGE_VIDEO',
}
type ActionPayload = {
  [Types.Show]: {
    currentPlaying: {
      videoId: string;
      videoUrl: string;
      thumbnailUrl: string;
      title: string;
    };
    videoItems: Array<any>;
  };
  [Types.Hide]: {};
  [Types.ChangeVideo]: {
    currentPlaying: {
      videoId: string;
      videoUrl: string;
      thumbnailUrl: string;
      title: string;
    };
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
type CurrentPlayingViewAction = ActionMap<ActionPayload>[keyof ActionMap<
  ActionPayload
>];
type State = {
  visible: boolean;
  currentPlaying: {
    videoId: string;
    videoUrl: string;
    thumbnailUrl: string;
    title: string;
  };
  videoItems: Array<any>;
};
const reducer = (prevState: State, action: CurrentPlayingViewAction) => {
  switch (action.type) {
    case Types.Show: {
      if (prevState.currentPlaying.videoId !== action.currentPlaying.videoId) {
        return {
          ...prevState,
          visible: true,
          videoItems: action.videoItems,
          currentPlaying: action.currentPlaying,
        };
      }
      return {...prevState};
    }
    case Types.Hide:
      return {
        ...prevState,
        visible: false,
        currentPlaying: {
          videoId: '',
          videoUrl: '',
          thumbnailUrl: '',
          title: '',
        },
      };
    case Types.ChangeVideo:
      return {...prevState, currentPlaying: action.currentPlaying};
    default: {
      return {
        ...prevState,
      };
    }
  }
};
type CurrentPlayingViewContextProps = {
  visible: boolean;
  currentPlaying: {
    videoId: string;
    videoUrl: string;
    thumbnailUrl: string;
    title: string;
  };
  videoItems: Array<any>;
  dispatch: React.Dispatch<any>;
};
export const CurrentPlayingViewContext = createContext<
  CurrentPlayingViewContextProps
>({
  visible: false,
  videoItems: [],
  currentPlaying: {
    videoId: '',
    videoUrl: '',
    thumbnailUrl: '',
    title: '',
  },
  dispatch: () => null,
});

const {Provider} = CurrentPlayingViewContext;
export default ({
  children,
}: {
  children: React.ReactElement;
}): React.ReactElement => {
  const [state, dispatch] = useReducer(reducer, {
    visible: false,
    videoItems: [],
    currentPlaying: {
      videoId: '',
      videoUrl: '',
      thumbnailUrl: '',
      title: '',
    },
  });
  const currentPlayingViewContext = useMemo(
    () => ({
      visible: state.visible,
      currentPlaying: state.currentPlaying,
      videoItems: state.videoItems,
      dispatch,
    }),
    [state],
  );
  return <Provider value={currentPlayingViewContext}>{children}</Provider>;
};
