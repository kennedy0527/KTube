import React, {useState, useContext, useMemo, useCallback} from 'react';
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
import AddModal from '../components/addmodal';
import useYoutube from '../utils/useyoutube';
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
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [userMenuVisible, setUserMenuVisible] = useState(false);

  // const {
  //   fetchVideoInfo,
  //   fetchWebPage,
  //   analyzeVideoInfo,
  //   analyzeVideoUrl,
  // } = useYoutube();

  // const ToogleThemeAction = (): React.ReactElement =>
  //   theme === 'light' ? (
  //     <TopNavigationAction icon={DarkIcon} onPress={toggleTheme} />
  //   ) : (
  //     <TopNavigationAction icon={LightIcon} onPress={toggleTheme} />
  //   );
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
  const UserMenus = useCallback(() => {
    if (currentUser) {
      return (
        <OverflowMenu
          anchor={() => renderMenuAction(currentUser.user.photo || '')}
          visible={userMenuVisible}
          onBackdropPress={toggleUserMenu}>
          <MenuItem
            accessoryLeft={SignOutIcon}
            title="Sign Out"
            onPress={() => {
              toggleUserMenu();
              signOut();
            }}
          />
          <MenuItem
            accessoryLeft={DownloadIcon}
            title="Import Playlists"
            onPress={() => {
              setImportModalVisible(true);
            }}
          />
          <MenuItem
            accessoryLeft={DownloadIcon}
            title="Add Playlists"
            onPress={() => {
              setAddModalVisible(true);
            }}
          />
          {ToogleThemeAction()}
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
  }, [userMenuVisible, theme, currentUser]);
  const onImportModalDismiss = () => {
    setImportModalVisible(false);
  };
  const onAddModalDismiss = () => {
    setAddModalVisible(false);
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
        <AddModal
          visible={addModalVisible}
          onDismiss={onAddModalDismiss}
          setUserMenuVisible={setUserMenuVisible}
          refreshPlaylist={refreshPlaylist}
        />
      </>
    );
  }
  return (
    <>
      <TopNavigation
        title={title ? title : ''}
        alignment={alignment || 'center'}
        accessoryLeft={customLeft ? customLeft : ToogleThemeAction}
        accessoryRight={UserMenus}
      />
      {/* <Divider /> */}
      <ImportModal
        visible={importModalVisible}
        onDismiss={onImportModalDismiss}
        setUserMenuVisible={setUserMenuVisible}
        refreshPlaylist={refreshPlaylist}
      />
      <AddModal
        visible={addModalVisible}
        onDismiss={onAddModalDismiss}
        setUserMenuVisible={setUserMenuVisible}
        refreshPlaylist={refreshPlaylist}
      />
    </>
  );
};
