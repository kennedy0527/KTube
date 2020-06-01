import React, {useState, useCallback, useContext, useEffect} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Platform,
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
import useStorage, {
  PlaylistsStorage,
  PlaylistItemType,
  FavoritesType,
} from '../utils/usestorage';
import FavoritesList from '../components/favoriteslist';
import {RootStackParamList} from '../navigation/navigation';

const {width: screenWidth} = Dimensions.get('window');

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const DEMO = [
  {
    videoId: 'TomDxFRgeN8',
    title:
      'HYOLYN(효린) "말 없이 안아줘(Hug Me Silently) (feat. Crucial Star)" Official Audio',
    videoTimeLength: '4:09',
    thumbnailUrl:
      'https://i.ytimg.com/vi/TomDxFRgeN8/hqdefault.jpg?s…j0AgKJDeAE=&rs=AOn4CLBW6HcnyhrvOLoJTKbC27SMjRGEmQ',
  },
  {
    videoId: 'lyfy8KwOrV0',
    title:
      "TAEYEON (태연) - '그대라는 시 (All About  You, Hotel Del Luna OST)' (Cover by. Blue.D)",
    videoTimeLength: '3:40',
    thumbnailUrl:
      'https://i.ytimg.com/vi/lyfy8KwOrV0/hqdefault.jpg?s…j0AgKJDeAE=&rs=AOn4CLB10hwwg9v0RyD1_5sT6znsMl_hcQ',
  },
  {
    videoId: 'TomDxFRgeN8',
    title:
      'HYOLYN(효린) "말 없이 안아줘(Hug Me Silently) (feat. Crucial Star)" Official Audio',
    videoTimeLength: '4:09',
    thumbnailUrl:
      'https://i.ytimg.com/vi/TomDxFRgeN8/hqdefault.jpg?s…j0AgKJDeAE=&rs=AOn4CLBW6HcnyhrvOLoJTKbC27SMjRGEmQ',
  },
  {
    videoId: 'lyfy8KwOrV0',
    title:
      "TAEYEON (태연) - '그대라는 시 (All About  You, Hotel Del Luna OST)' (Cover by. Blue.D)",
    videoTimeLength: '3:40',
    thumbnailUrl:
      'https://i.ytimg.com/vi/lyfy8KwOrV0/hqdefault.jpg?s…j0AgKJDeAE=&rs=AOn4CLB10hwwg9v0RyD1_5sT6znsMl_hcQ',
  },
  {
    videoId: 'TomDxFRgeN8',
    title:
      'HYOLYN(효린) "말 없이 안아줘(Hug Me Silently) (feat. Crucial Star)" Official Audio',
    videoTimeLength: '4:09',
    thumbnailUrl:
      'https://i.ytimg.com/vi/TomDxFRgeN8/hqdefault.jpg?s…j0AgKJDeAE=&rs=AOn4CLBW6HcnyhrvOLoJTKbC27SMjRGEmQ',
  },
  {
    videoId: 'lyfy8KwOrV0',
    title:
      "TAEYEON (태연) - '그대라는 시 (All About  You, Hotel Del Luna OST)' (Cover by. Blue.D)",
    videoTimeLength: '3:40',
    thumbnailUrl:
      'https://i.ytimg.com/vi/lyfy8KwOrV0/hqdefault.jpg?s…j0AgKJDeAE=&rs=AOn4CLB10hwwg9v0RyD1_5sT6znsMl_hcQ',
  },
];
export default ({
  navigation,
}: {
  navigation: HomeScreenNavigationProp;
}): React.ReactElement => {
  const [playlists, setPlaylists] = useState<
    PlaylistsStorage | {type: 'more'}[]
  >([]);

  const [limitFavorite, setLimitFavorites] = useState<PlaylistItemType[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(false);
  const {getPlaylists, removePlaylist, getFavorites} = useStorage();
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

      setPlaylists([...storagePlaylists.reverse().slice(0, 3), {type: 'more'}]);
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
      favorites,
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
  const onPlaylistMore = () => {};
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
            source={{uri: item.thumbnail}}
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
          </Layout>

          <Layout style={styles.header}>
            <Layout style={styles.headerTitle}>
              <Text category="h4">Favorites</Text>
            </Layout>
            <Layout style={styles.moreContainer}>
              <TouchableOpacity onPress={onMorePress}>
                <Layout>
                  <Text category={'s1'}>More</Text>
                </Layout>
              </TouchableOpacity>
            </Layout>
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
  playlistCardContainer: {height: 200, marginVertical: 10},
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
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
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
});
