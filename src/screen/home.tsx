import React, {useState, useCallback, useContext, useEffect} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Appearance,
} from 'react-native';
import {
  Layout,
  Text,
  Button,
  StyleService,
  useStyleSheet,
} from '@ui-kitten/components';
import {useFocusEffect} from '@react-navigation/native';
import Carousel, {ParallaxImage} from 'react-native-snap-carousel';
import {StackNavigationProp} from '@react-navigation/stack';
import Modal from 'react-native-modal';
import {CurrentPlayingViewContext} from '../context/currentplayingview-context';
import {UserDataContext} from '../context/userdata-context';
import CustomeTopNavigation from '../components/customtopnaviagtion';
import {
  PlaylistsStorage,
  PlaylistItemType,
  FavoritesType,
  getPlaylists,
  removePlaylist,
} from '../utils/usestorage';
import FavoritesList from '../components/favoriteslist';
import {RootStackParamList} from '../navigation/navigation';

const {width: screenWidth} = Dimensions.get('window');

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export default ({
  navigation,
}: {
  navigation: HomeScreenNavigationProp;
}): React.ReactElement => {
  const [playlists, setPlaylists] = useState<
    (PlaylistsStorage | {type: 'more'})[] | []
  >([]);

  const [limitFavorite, setLimitFavorites] = useState<PlaylistItemType>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(false);

  const {visible, dispatch} = useContext(CurrentPlayingViewContext);
  const {favorites} = useContext(UserDataContext);
  const styles = useStyleSheet(themedStyles);

  useFocusEffect(
    useCallback(() => {
      onGetDatas();
    }, []),
  );
  useEffect(() => {
    setLimitFavorites([...favorites.videos].reverse().slice(0, 20));
  }, [favorites]);
  const onGetDatas = async () => {
    await getPlaylistsFromStorage();
  };
  const getPlaylistsFromStorage = async () => {
    try {
      const storagePlaylists = await getPlaylists();
      const showPlaylists: (PlaylistsStorage | {type: 'more'})[] = [
        ...storagePlaylists.reverse().slice(0, 3),
      ];
      if (storagePlaylists.length >= 3) {
        showPlaylists.push({type: 'more'});
      }
      setPlaylists(showPlaylists);
    } catch (error) {
      console.log(error);
    }
  };

  const onPress = ({id, title, thumbnail, dateTime}: PlaylistsStorage) => {
    navigation.navigate('Videos', {
      playlistId: id,
      title,
      thumbnail,
      dateTime: dateTime || '',
    });
  };

  const onLongPress = (selectedItem: PlaylistsStorage) => {
    setSelectedItem(selectedItem);
    setModalVisible(!modalVisible);
  };
  const onMorePress = () => {
    navigation.navigate('Favorites');
  };

  const onCancel = () => {
    setModalVisible(!modalVisible);
  };
  const onRemove = async () => {
    await removePlaylist(selectedItem.id);
    setSelectedItem(false);
    setModalVisible(!modalVisible);
    await getPlaylistsFromStorage();
  };
  const onPlaylistMore = () => {
    navigation.navigate('Playlists');
  };
  const renderModalContent = () => {
    if (selectedItem) {
      return (
        <>
          <Layout style={{alignItems: 'center', marginTop: 12}}>
            <Text category="h5">{selectedItem.title}</Text>
            <Text
              style={{marginTop: 10}}
              appearance="hint">{`include ${selectedItem.playlistItems.length} videos`}</Text>
          </Layout>

          <Layout style={styles.btnGroup}>
            <Button appearance="ghost" onPress={onCancel}>
              Cancel
            </Button>
            <Button appearance="ghost" status="danger" onPress={onRemove}>
              Remove
            </Button>
          </Layout>
        </>
      );
    }
    return null;
  };
  const renderPlaylistCard = (
    {item, index}: {item: PlaylistsStorage & {type: 'more'}; index: number},
    parallaxProps: any,
  ) => {
    if (item.type === 'more') {
      return (
        <TouchableOpacity
          key={item.id}
          onPress={() => onPlaylistMore()}
          activeOpacity={0.8}>
          <Layout style={styles.item}>
            <Layout style={styles.seeMore}>
              <Text category="h6" numberOfLines={1}>
                See More
              </Text>
            </Layout>
          </Layout>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => onPress(item)}
        onLongPress={() => onLongPress(item)}
        activeOpacity={0.8}>
        <Layout style={styles.item}>
          <ParallaxImage
            source={{
              uri: item.thumbnail,
            }}
            containerStyle={styles.imageContainer}
            style={styles.image}
            parallaxFactor={0.4}
            {...parallaxProps}
          />
          <Layout style={styles.playlistTitleContiner}>
            <Text category="h6" style={styles.playlistTitle} numberOfLines={1}>
              {item.title}
            </Text>
          </Layout>
        </Layout>
      </TouchableOpacity>
    );
  };
  return (
    <>
      <SafeAreaView style={styles.wrapper}>
        <Layout style={styles.container}>
          <Layout style={styles.header}>
            <Layout style={styles.headerTitle}>
              <Text category="h2">Home</Text>
            </Layout>
            <Layout style={styles.userMenu}>
              <CustomeTopNavigation
                refreshPlaylist={onGetDatas}
                mode={'onlyavatar'}
              />
            </Layout>
          </Layout>
          <Layout style={styles.playlistCardContainer}>
            {playlists.length > 0 ? (
              <Carousel
                sliderWidth={screenWidth}
                sliderHeight={200}
                itemWidth={screenWidth - 60}
                itemHeight={200}
                inactiveSlideScale={1}
                data={playlists}
                renderItem={renderPlaylistCard}
                hasParallaxImages
              />
            ) : (
              <Layout style={styles.emptyContainer}>
                <Text category={'h6'} appearance={'hint'}>
                  Playlists are empty.
                </Text>
                <Text category={'s2'} appearance={'hint'}>
                  Please import playlist from user menu.
                </Text>
              </Layout>
            )}
          </Layout>

          <Layout style={styles.header}>
            <Layout style={styles.headerTitle}>
              <Text category="h4">Favorites</Text>
            </Layout>
            {limitFavorite.length > 0 ? (
              <Layout style={styles.moreContainer}>
                <TouchableOpacity onPress={onMorePress}>
                  <Layout>
                    <Text category={'s1'}>More</Text>
                  </Layout>
                </TouchableOpacity>
              </Layout>
            ) : null}
          </Layout>
          <FavoritesList
            favorites={limitFavorite}
            visible={visible}
            dispatch={dispatch}
          />
        </Layout>
      </SafeAreaView>
      <Modal
        animationIn={'fadeIn'}
        animationOut={'fadeOut'}
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(!modalVisible)}
        useNativeDriver
        hideModalContentWhileAnimating>
        <Layout style={styles.modalView}>{renderModalContent()}</Layout>
      </Modal>
    </>
  );
};

const themedStyles = StyleService.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'background-basic-color-1',
  },
  header: {
    flexDirection: 'row',
    marginVertical: 10,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
  },
  moreContainer: {
    paddingHorizontal: 5,
  },
  playlistCardContainer: {
    position: 'relative',
    height: 200,
    marginHorizontal: -10,
    marginVertical: 10,
  },
  userMenu: {
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },
  item: {
    position: 'relative',
    width: screenWidth - 60,
    height: 200,
    paddingHorizontal: 10,
  },
  seeMore: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'background-basic-color-2',
    borderRadius: 8,
  },
  playlistTitleContiner: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,.5)',
  },
  playlistTitle: {
    color: 'white',
    margin: 10,
  },
  imageContainer: {
    flex: 1,
    marginBottom: Platform.select({ios: 0, android: 1}),
    backgroundColor: 'white',
    borderRadius: 8,
  },
  image: {
    // ...StyleSheet.absoluteFillObject,
    aspectRatio: 1.8,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    marginHorizontal: 10,
  },
  text: {
    textAlign: 'center',
  },
  likeButton: {
    marginVertical: 16,
  },
  modalView: {
    margin: 20,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  btnGroup: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: screenWidth - 60,
    height: 200,
    alignSelf: 'center',
    paddingHorizontal: 10,
    backgroundColor: 'background-empty-color',
    borderRadius: 8,
  },
});
