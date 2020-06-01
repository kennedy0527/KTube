import React, {useState, Dispatch, SetStateAction} from 'react';
import {
  Keyboard,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ImageProps,
} from 'react-native';
import {
  Button,
  Layout,
  Spinner,
  Input,
  useTheme,
  StyleService,
  useStyleSheet,
} from '@ui-kitten/components';
import {RenderProp} from '@ui-kitten/components/devsupport';
import Modal from 'react-native-modal';
import useYoutube from '../utils/useyoutube';
import useStorage from '../utils/usestorage';
import {ClearIcon} from './icons';

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
  const [importing, setImportaing] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const {
    fetchSinglePlaylist,
    fetchPlaylistItems,
    fetchWebPage,
    analyzeVideoInfo,
  } = useYoutube();
  const {savePlaylist} = useStorage();
  const styles = useStyleSheet(themedStyles);
  const onCloseModal = () => {
    Keyboard.dismiss();
    setPlaylistUrl('');
    onDismiss();
  };

  const onImportPlaylist = async (playlistID: string) => {
    try {
      setImportaing(true);
      const playlist = await fetchSinglePlaylist(playlistID);
      if (playlist && playlist.length != 0) {
        const playlistItems = (await fetchPlaylistItems(playlistID)) || [];
        const videos = [];
        for (const playlistItem of playlistItems) {
          const {
            contentDetails: {videoId},
          } = playlistItem;
          const {playerResp} = await fetchWebPage(videoId);
          const videoInfo = analyzeVideoInfo(playerResp);
          if (videoInfo) {
            videos.push(videoInfo);
          }
        }
        const {
          id,
          snippet: {title, thumbnails},
        } = playlist[0];
        await savePlaylist({
          id,
          title,
          thumbnail: thumbnails.high.url,
          playlistItems: videos,
        });
        setImportaing(false);
        refreshPlaylist && refreshPlaylist();

        onCloseModal();
        setUserMenuVisible(false);
      } else {
        Alert.alert(
          "Couldn't Get Playlist Information",
          'make sure your youtube playlist url is correct',
        );
      }
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Couldn't Get Playlist Information",
        'make sure your youtube playlist url is correct',
      );
    }
  };
  const onPress = () => {
    const playlistID = playlistUrl.split('list=')[1];
    if (playlistID) {
      Keyboard.dismiss();
      onImportPlaylist(playlistID);
    } else {
      Alert.alert(
        "Couldn't Get Playlist Id",
        'make sure your youtube playlist url is correct',
      );
    }
  };
  const clear = () => {
    setPlaylistUrl('');
  };
  const renderIcon: RenderProp<Partial<ImageProps>> = () => {
    if (playlistUrl !== '') {
      return (
        <TouchableOpacity onPress={clear}>
          <ClearIcon style={styles.clearIcon} />
        </TouchableOpacity>
      );
    }
    return <></>;
  };

  return (
    <Modal
      animationIn={'fadeIn'}
      animationOut={'fadeOut'}
      isVisible={visible}
      onBackdropPress={onCloseModal}
      useNativeDriver
      hideModalContentWhileAnimating>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <Layout style={styles.modalView}>
          <Input
            style={styles.input}
            placeholder="Enter Youtube playlist url"
            value={playlistUrl}
            accessoryRight={renderIcon}
            onChangeText={(nextValue) => setPlaylistUrl(nextValue)}
          />
          <Button style={styles.importBtn} appearance="ghost" onPress={onPress}>
            Import
          </Button>
        </Layout>
      </TouchableWithoutFeedback>
      <Modal
        isVisible={importing}
        style={styles.spinnerModal}
        useNativeDriver
        hideModalContentWhileAnimating>
        <Layout style={styles.spinnerInner}>
          <Spinner status="info" />
        </Layout>
      </Modal>
    </Modal>
  );
};
const themedStyles = StyleService.create({
  centeredView: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    borderRadius: 10,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    marginTop: 12,
    backgroundColor: 'background-basic-color-2',
  },
  importBtn: {marginTop: 20},
  openButton: {
    backgroundColor: '#F194FF',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  clearIcon: {
    width: 20,
    height: 20,
    marginHorizontal: 8,
    tintColor: '#8F9BB3',
  },
  spinnerModal: {alignItems: 'center'},
  spinnerInner: {
    width: 100,
    borderRadius: 20,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
