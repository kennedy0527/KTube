import React, {
  useState,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import {
  Button,
  TopNavigation,
  TopNavigationAction,
  Avatar,
  OverflowMenu,
  MenuItem,
} from '@ui-kitten/components';
import {ThemeContext} from '../context/theme-context';
import {AuthContext} from '../context/auth-context';
import {LightIcon, DarkIcon, SignOutIcon, DownloadIcon} from './icons';
import ImportModal from '../components/importmodal';
import useYoutube from '../utils/useyoutube';
import useTraceUpdate from '../utils/usetraceupdate';
interface Props {
  customLeft?: () => React.ReactElement;
  title?: string;
  alignment?: 'start' | 'center';
  refreshPlaylist?: () => void;
  mode?: 'onlyavatar' | 'default';
}

export default ({
  customLeft,
  title,
  alignment,
  refreshPlaylist,
  mode = 'default',
}: Props): React.ReactElement => {
  // const {theme, toggleTheme} = useContext(ThemeContext);
  const {currentUser, signIn, signOut} = useContext(AuthContext);
  const {theme, toggleTheme} = useContext(ThemeContext);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [userMenuVisible, setUserMenuVisible] = useState(false);

  // const {
  //   fetchVideoInfo,
  //   fetchWebPage,
  //   analyzeVideoInfo,
  //   analyzeVideoUrl,
  // } = useYoutube();
  useTraceUpdate({
    theme,
    currentUser,
    userMenuVisible,
    importModalVisible,
    mode,
    customLeft,
    alignment,
    refreshPlaylist,
  });
  const ToogleThemeAction = () => {
    return (
      <MenuItem
        accessoryLeft={theme === 'light' ? DarkIcon : LightIcon}
        title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        onPress={toggleTheme}
      />
    );
  };
  const toggleUserMenu = () => {
    setUserMenuVisible(!userMenuVisible);
  };
  const renderMenuAction = (photo: string) => (
    <TopNavigationAction
      icon={() => <Avatar source={{uri: photo}} />}
      onPress={toggleUserMenu}
      activeOpacity={0.5}
    />
  );
  const onSignOut = () => {
    toggleUserMenu();
    signOut();
  };
  const onImportPlaylists = () => {
    setImportModalVisible(true);
  };
  const UserMenus = () => {
    if (currentUser) {
      return (
        <OverflowMenu
          anchor={() => renderMenuAction(currentUser.user.photo || '')}
          visible={userMenuVisible}
          onBackdropPress={toggleUserMenu}>
          <MenuItem
            accessoryLeft={SignOutIcon}
            title="Sign Out"
            onPress={onSignOut}
          />
          <MenuItem
            accessoryLeft={DownloadIcon}
            title="Import Playlists"
            onPress={onImportPlaylists}
          />
          {/* {ToogleThemeAction()} */}
          <MenuItem
            accessoryLeft={theme === 'light' ? DarkIcon : LightIcon}
            title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            onPress={toggleTheme}
          />
          {/* <MenuItem
            accessoryLeft={DownloadIcon}
            title="Test "
            onPress={async () => {
              // fetchVideoInfo('TomDxFRgeN8');
              const {playerScriptUrl, playerResp} = await fetchWebPage(
                'tJM0yIbg8iQ',
              );
              const videoInfo = analyzeVideoInfo(playerResp);
              const videoUrl = await analyzeVideoUrl(
                playerResp,
                playerScriptUrl,
              );
              console.log(videoInfo);
              console.log(videoUrl);
            }}
          /> */}
        </OverflowMenu>
      );
    }
    return (
      <Button onPress={signIn} appearance="ghost">
        Sign In
      </Button>
    );
  };
  const onImportModalDismiss = () => {
    setImportModalVisible(false);
  };
  if (mode === 'onlyavatar') {
    return (
      <>
        <UserMenus />
        <ImportModal
          visible={importModalVisible}
          onDismiss={onImportModalDismiss}
          setUserMenuVisible={setUserMenuVisible}
          refreshPlaylist={refreshPlaylist}
        />
      </>
    );
  }
  return (
    <>
      <TopNavigation
        style={{paddingHorizontal: 10}}
        alignment={alignment || 'center'}
        accessoryLeft={customLeft ? customLeft : ToogleThemeAction}
        accessoryRight={UserMenus}
      />
      <ImportModal
        visible={importModalVisible}
        onDismiss={onImportModalDismiss}
        setUserMenuVisible={setUserMenuVisible}
        refreshPlaylist={refreshPlaylist}
      />
    </>
  );
};
