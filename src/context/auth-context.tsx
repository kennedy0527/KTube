import React, {createContext, useMemo, useReducer, useEffect} from 'react';
import {GoogleSignin, statusCodes} from '@react-native-community/google-signin';
import type {User} from '@react-native-community/google-signin';
import AsyncStorage from '@react-native-community/async-storage';
import {saveCurrentUserInfo} from '../utils/usestorage';
import {IOS_CLIENT_ID} from 'react-native-dotenv';

export enum Types {
  Restore = 'RESTORE_TOKEN',
  SignIn = 'SIGN_IN',
  SignOut = 'SIGN_OUT',
  Error = 'ERROR',
  ErrorSeen = 'ERRORSEEN',
}
type ActionPayload = {
  [Types.Restore]: {
    token: string;
    userInfo: User;
  };
  [Types.SignIn]: {
    token: string;
    userInfo: User;
  };
  [Types.SignOut]: {};
  [Types.Error]: {
    errMsg: string;
  };
  [Types.ErrorSeen]: {};
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
type AuthAction = ActionMap<ActionPayload>[keyof ActionMap<ActionPayload>];
type State = {
  isLoading: boolean;
  isSignout: boolean;
  accessToken: string | null;
  errMsg: string;
  err: boolean;
  currentUser: User | null;
};

const reducer = (prevState: State, action: AuthAction) => {
  switch (action.type) {
    case Types.Restore:
      return {
        ...prevState,
        errMsg: '',
        err: false,
        accessToken: action.token,
        isSignout: false,
        currentUser: action.userInfo,
        isLoading: false,
      };

    case Types.SignIn:
      return {
        ...prevState,
        isSignout: false,
        errMsg: '',
        err: false,
        currentUser: action.userInfo,
        accessToken: action.token,
      };
    case Types.SignOut:
      return {
        ...prevState,
        errMsg: '',
        err: false,
        isSignout: true,
        accessToken: null,
        currentUser: null,
      };
    case Types.Error:
      return {
        ...prevState,
        errMsg: action.errMsg,
        err: true,
        isSignout: true,
        accessToken: null,
        currentUser: null,
      };
    case Types.ErrorSeen:
      return {
        ...prevState,
        errMsg: '',
        err: false,
        isSignout: true,
        accessToken: null,
        currentUser: null,
      };
    default: {
      return {
        ...prevState,
      };
    }
  }
};
type AuthContextProps = {
  accessToken: string | null;
  currentUser: User | null;
  isSignout: boolean;
  errMsg: string;
  errModal: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  signInSilently: () => Promise<void>;
  dispatch: React.Dispatch<any>;
};
export const AuthContext = createContext<AuthContextProps>({
  accessToken: '',
  currentUser: null,
  isSignout: true,
  errMsg: '',
  errModal: false,
  signIn: async () => {},
  signOut: async () => {},
  signInSilently: async () => {},
  dispatch: () => null,
});
const {Provider} = AuthContext;
export default ({
  children,
}: {
  children: React.ReactElement;
}): React.ReactElement => {
  const [state, dispatch] = useReducer(reducer, {
    isLoading: true,
    isSignout: true,
    accessToken: null,
    errMsg: '',
    err: false,
    currentUser: null,
  });

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        GoogleSignin.configure({
          scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
          offlineAccess: false,
          iosClientId: IOS_CLIENT_ID,
        });
        const userInfo = await signInSilently();
        const token = await getTokens();
        if (userInfo && token) {
          await saveCurrentUserInfo(userInfo);
          dispatch({type: Types.Restore, token, userInfo});
        }
      } catch (e) {
        console.log(e);
      }
    };

    bootstrapAsync();
  }, []);
  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      return userInfo;
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
        // dispatch({
        //   type: Types.Error,
        //   errMsg: 'Cancel',
        // });
        console.log('Cancel');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
        dispatch({
          type: Types.Error,
          errMsg: 'having issue with Sign In, please try again later',
        });
        // throw new Error('having issue with Sign In, please try again later');
      } else {
        // some other error happened
        dispatch({
          type: Types.Error,
          errMsg: 'having issue with Sign In, please try again later',
        });
        // throw new Error('having issue with Sign In, please try again later');
      }
    }
  };
  const signInSilently = async () => {
    try {
      const userInfo = await GoogleSignin.signInSilently();
      return userInfo;
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_REQUIRED) {
        // setIsLogin(false);
      } else {
        // setIsLogin(false);
      }
      throw new Error('Need Sign In');
    }
  };
  const getTokens = async () => {
    try {
      const {accessToken} = await GoogleSignin.getTokens();
      return accessToken;
    } catch (error) {
      console.log(error);
      // throw new Error('Cannot Get Token');
    }
  };
  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error(error);
    }
  };

  const authContext = useMemo(
    () => ({
      accessToken: state.accessToken,
      isSignout: state.isSignout,
      currentUser: state.currentUser,
      errMsg: state.errMsg,
      errModal: state.err,
      signIn: async () => {
        try {
          const userInfo = await signIn();
          const token = await getTokens();
          if (userInfo && token) {
            await saveCurrentUserInfo(userInfo);
            dispatch({type: Types.SignIn, token, userInfo});
          }
        } catch (error) {
          console.log(error);
          dispatch({
            type: Types.Error,
            errMsg: 'having issue to sign in to google, please try again later',
          });
        }
      },
      signOut: async () => {
        try {
          await signOut();
          dispatch({type: Types.SignOut});
        } catch (error) {
          dispatch({
            type: Types.Error,
            errMsg:
              'having issue to sign out to google, please try again later',
          });
        }
      },
      signInSilently: async () => {
        try {
          const userInfo = await signInSilently();
          const token = await getTokens();
          if (userInfo && token) {
            await saveCurrentUserInfo(userInfo);
            dispatch({type: Types.SignIn, token, userInfo});
          }
        } catch (error) {
          console.log(error);
          dispatch({
            type: Types.Error,
            errMsg: 'having issue to sign in to google, please try again later',
          });
        }
      },
      dispatch,
    }),
    [state],
  );

  return <Provider value={authContext}>{children}</Provider>;
};
