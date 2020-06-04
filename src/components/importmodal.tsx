import React, {useState, Dispatch, SetStateAction} from 'react';
import {SafeAreaView} from 'react-native';
import {
  Button,
  Layout,
  useTheme,
  TopNavigation,
  TopNavigationAction,
  List,
  ListItem,
  Radio,
  Spinner,
  StyleService,
  useStyleSheet,
} from '@ui-kitten/components';
import Modal from 'react-native-modal';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';
import AddModal from '../components/addmodal';

import {CloseIcon} from '../components/icons';
import useYoutube from '../utils/useyoutube';
import {savePlaylist} from '../utils/usestorage';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  setUserMenuVisible: Dispatch<SetStateAction<boolean>>;
  refreshPlaylist?: () => void;
};

export default ({
  visible,
  onDismiss,
  setUserMenuVisible,
  refreshPlaylist,
}: Props): React.ReactElement => {
  const navigation = useNavigation();
  const [isFetching, setIsFetching] = useState(false);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [importing, setImportaing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedPlaylists, setselectedPlaylists] = useState<string[]>([]);
  const {
    fetchPlaylists,
    fetchPlaylistItems,
    fetchWebPage,
    analyzeVideoInfo,
  } = useYoutube();

  const styles = useStyleSheet(themedStyles);
  const onCloseModal = () => {
    onDismiss();
  };
  const onModalDismiss = () => {
    setselectedPlaylists([]);
    setPlaylists([]);
    setIsFetching(false);
    onDismiss();
  };
  const onImportPlaylists = async () => {
    try {
      setImportaing(true);
      const getVideoIndo = async (videoId: string) => {
        try {
          const {playerResp} = await fetchWebPage(videoId);
          const videoInfo = analyzeVideoInfo(playerResp);
          if (videoInfo) {
            return videoInfo;
          }
          return undefined;
        } catch (error) {
          console.log(error);
          return undefined;
        }
      };
      for (const playlistId of selectedPlaylists) {
        const playlistItems = (await fetchPlaylistItems(playlistId)) || [];
        const {
          id,
          snippet: {title, thumbnails},
        } = playlists.filter((playlist) => playlist.id === playlistId)[0];

        // const videos = [];
        // for (const playlistItem of playlistItems) {
        //   const {
        //     contentDetails: {videoId},
        //   } = playlistItem;
        //   const {playerResp} = await fetchWebPage(videoId);
        //   const videoInfo = analyzeVideoInfo(playerResp);
        //   if (videoInfo) {
        //     videos.push(videoInfo);
        //   }
        // }
        const promises = playlistItems.map((playlistItem) =>
          getVideoIndo(playlistItem.contentDetails.videoId),
        );
        const videosInfo = await Promise.all(promises);
        const videos = videosInfo.filter((vi) => vi !== undefined);
        const thumbnail = thumbnails.standard
          ? thumbnails.standard.url
          : thumbnails.high.url;
        await savePlaylist({
          id,
          title,
          thumbnail,
          playlistItems: videos,
        });
        refreshPlaylist && refreshPlaylist();
        navigation.navigate('Home');
      }
      setImportaing(false);
      onDismiss();
      setUserMenuVisible(false);
    } catch (error) {
      setImportaing(false);
      console.log(error);
    }
  };
  const CloseModalAction = (): React.ReactElement => (
    <TopNavigationAction icon={CloseIcon} onPress={onCloseModal} />
  );
  const onAddModalPress = () => {
    setAddModalVisible(true);
  };
  const onAddModalDismiss = () => {
    setAddModalVisible(false);
  };
  const ImportAction = (): React.ReactElement => (
    <Layout style={styles.accessRightContainer}>
      <Button onPress={onAddModalPress} appearance="ghost">
        Import from url
      </Button>
      <Button
        onPress={onImportPlaylists}
        appearance="ghost"
        style={selectedPlaylists.length === 0 && styles.btnDisable}
        disabled={selectedPlaylists.length === 0}>
        Import
      </Button>
    </Layout>
  );
  const onSelectPlaylist = (playlistId: string) => {
    const temp: string[] = [...selectedPlaylists];
    if (selectedPlaylists.indexOf(playlistId) !== -1) {
      temp.splice(selectedPlaylists.indexOf(playlistId), 1);
    } else {
      temp.push(playlistId);
    }

    setselectedPlaylists(temp);
  };
  const onShow = async () => {
    try {
      setIsFetching(true);
      onRefresh();
    } catch (error) {
      console.log(error);
    }
  };
  const onRefresh = async () => {
    try {
      const data = await fetchPlaylists();
      setPlaylists(data);
      setIsFetching(false);
    } catch (error) {
      console.log(error);
      setIsFetching(false);
    }
  };
  const renderPlaylists = ({item}: any) => {
    const {
      snippet: {thumbnails},
    } = item;

    const imageUrl = thumbnails.standard
      ? thumbnails.standard.url
      : thumbnails.high.url;
    return (
      <ListItem
        title={`${item.snippet.title}`}
        description={`Total ${item.contentDetails.itemCount} videos`}
        onPress={() => onSelectPlaylist(item.id)}
        accessoryLeft={() => (
          <Layout style={styles.thumbnailContainer}>
            <FastImage style={styles.thumbnail} source={{uri: imageUrl}} />
          </Layout>
        )}
        accessoryRight={() => (
          <Radio
            checked={selectedPlaylists.indexOf(item.id) !== -1}
            onChange={() => onSelectPlaylist(item.id)}
          />
        )}
      />
    );
  };
  return (
    <>
      <Modal
        isVisible={visible}
        hasBackdrop={false}
        style={styles.modal}
        onModalShow={onShow}
        onModalHide={onModalDismiss}>
        <SafeAreaView style={styles.modalWrapper}>
          <Layout style={styles.container}>
            <TopNavigation
              alignment="center"
              accessoryLeft={CloseModalAction}
              accessoryRight={ImportAction}
            />
            <List
              style={styles.list}
              data={playlists}
              renderItem={renderPlaylists}
              refreshing={isFetching}
              onRefresh={onRefresh}
            />
            <Modal
              animationIn={'fadeIn'}
              animationOut={'fadeOut'}
              isVisible={importing}
              style={styles.spinnerModal}>
              <Layout style={styles.spinnerContainer}>
                <Spinner status="info" />
              </Layout>
            </Modal>
            <AddModal
              visible={addModalVisible}
              onDismiss={onAddModalDismiss}
              // setUserMenuVisible={setUserMenuVisible}
              refreshPlaylist={refreshPlaylist}
            />
          </Layout>
        </SafeAreaView>
      </Modal>
    </>
  );
};
const themedStyles = StyleService.create({
  btnDisable: {backgroundColor: 'transparent'},
  thumbnailContainer: {flex: 1, height: 100},
  thumbnail: {width: '100%', height: '100%'},
  modal: {margin: 0},
  modalWrapper: {
    flex: 1,
    backgroundColor: 'background-basic-color-1',
  },
  list: {
    flex: 1,
    backgroundColor: 'background-basic-color-1',
  },
  container: {
    flex: 1,
    marginHorizontal: 10,
  },
  spinnerModal: {alignItems: 'center'},
  spinnerContainer: {
    width: 100,
    borderRadius: 20,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accessRightContainer: {
    flexDirection: 'row',
  },
});
