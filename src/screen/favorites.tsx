import React, {useContext, useState, useCallback} from 'react';
import {TouchableOpacity, SafeAreaView} from 'react-native';
import {
  Layout,
  Text,
  useTheme,
  StyleService,
  useStyleSheet,
  Button,
} from '@ui-kitten/components';
import {StackNavigationProp} from '@react-navigation/stack';
import {PlaylistItemType, saveFavorites} from '../utils/usestorage';
import {
  CurrentPlayingViewContext,
  Types,
} from '../context/currentplayingview-context';
import {
  BackIcon,
  ShuffleIcon,
  PlayIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '../components/icons';
import CustomeTopNavigation from '../components/customtopnaviagtion';
import {
  UserDataContext,
  Types as UserDataTypes,
} from '../context/userdata-context';
import FavoritesList from '../components/favoriteslist';
import {RootStackParamList} from '../navigation/navigation';
import {shuffle, convertToDuration} from '../utils/utils';
import useTraceUpdate from '../utils/usetraceupdate';

type FavoriteScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Favorites'
>;

export default ({navigation}: {navigation: FavoriteScreenNavigationProp}) => {
  const styles = useStyleSheet(themedStyles);
  const usetheme = useTheme();
  const {visible, currentPlaying, dispatch} = useContext(
    CurrentPlayingViewContext,
  );
  const {favorites, dispatch: userDataDispatch} = useContext(UserDataContext);
  const [favoriteVideos, setFavoritesVideos] = useState<PlaylistItemType[]>(
    favorites.sort === 0 ? favorites.videos : [...favorites.videos].reverse(),
  );

  const goBack = () => {
    navigation.goBack();
  };
  const CustomBackAction = (): React.ReactElement => (
    <TouchableOpacity onPress={goBack}>
      <Layout style={styles.backActionContainer}>
        <BackIcon style={styles.backIcon} fill={usetheme['text-basic-color']} />
        <Text category={'s1'}>Home</Text>
      </Layout>
    </TouchableOpacity>
  );
  const onPlayPress = useCallback(async () => {
    try {
      const {videoId, thumbnailUrl, title} = favoriteVideos[0];
      if (videoId !== currentPlaying.videoId) {
        dispatch({
          type: Types.Show,
          videoItems: favorites,
          currentPlaying: {
            videoId,
            videoUrl: '',
            thumbnailUrl,
            title,
          },
        });
      }
    } catch (error) {
      console.log(error);
    }
  }, [favoriteVideos]);
  const onShufflePress = useCallback(async () => {
    try {
      const videos = [...favoriteVideos];

      shuffle(videos);

      const {videoId, thumbnailUrl, title} = videos[0];
      if (videoId !== currentPlaying.videoId) {
        dispatch({
          type: Types.Show,
          videoItems: videos,
          currentPlaying: {
            videoId,
            videoUrl: '',
            thumbnailUrl,
            title,
          },
        });
      } else {
        onShufflePress();
      }
    } catch (error) {
      console.log(error);
    }
  }, [favoriteVideos]);
  const onSortPress = useCallback(() => {
    userDataDispatch({
      type: UserDataTypes.SET_SORT,
      sort: favorites.sort === 0 ? 1 : 0,
    });
    saveFavorites(favorites.videos, favorites.sort === 0 ? 1 : 0);
    if (favorites.sort === 0) {
      setFavoritesVideos([...favorites.videos].reverse());
    } else {
      setFavoritesVideos(favorites.videos);
    }
  }, [favorites]);
  return (
    <SafeAreaView style={styles.wrapper}>
      <Layout style={styles.container}>
        <CustomeTopNavigation
          customLeft={CustomBackAction}
          title="Home"
          alignment="start"
        />
        <FavoritesList
          favorites={favoriteVideos}
          visible={visible}
          dispatch={dispatch}
          ListHeaderComponent={() => (
            <Layout style={styles.listHeader}>
              <Layout style={styles.listHeaderTexts}>
                <Text category="h2">Favorites</Text>
                <Text
                  category="s2"
                  style={{
                    marginTop: 5,
                    color: 'lightgray',
                  }}>{`${favorites.videos.length} videos, ${convertToDuration(
                  favorites.videos.reduce(
                    (accumulator, video) => accumulator + video.videoTimeLength,
                    0,
                  ),
                )}`}</Text>
              </Layout>

              <Layout style={styles.listHeaderBtns}>
                <Button
                  style={styles.btn}
                  activeOpacity={0.5}
                  status="primary"
                  onPress={onPlayPress}
                  accessoryLeft={() => <PlayIcon style={styles.icon} />}>
                  {() => <Text category="s1">Play</Text>}
                </Button>
                <Button
                  style={styles.btn}
                  activeOpacity={0.5}
                  status="primary"
                  onPress={onShufflePress}
                  accessoryLeft={() => <ShuffleIcon style={styles.icon} />}>
                  {() => <Text category="s1">Shuffle</Text>}
                </Button>
              </Layout>
              <Layout style={styles.sortContainer}>
                <TouchableOpacity onPress={onSortPress}>
                  <Layout style={styles.sortBtnInner}>
                    {favorites.sort === 0 ? (
                      <ArrowUpIcon
                        style={styles.sortIcon}
                        fill={usetheme['text-basic-color']}
                      />
                    ) : (
                      <ArrowDownIcon
                        style={styles.sortIcon}
                        fill={usetheme['text-basic-color']}
                      />
                    )}
                    <Text>Sort</Text>
                  </Layout>
                </TouchableOpacity>
              </Layout>
            </Layout>
          )}
        />
      </Layout>
    </SafeAreaView>
  );
};
const themedStyles = StyleService.create({
  wrapper: {
    position: 'relative',
    flex: 1,
    backgroundColor: 'background-basic-color-1',
  },
  container: {
    flex: 1,
  },
  backActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    width: 22,
    height: 22,
    marginRight: 5,
  },
  listHeader: {
    marginTop: 5,
    marginHorizontal: 8,
  },
  btn: {
    flex: 1,
    margin: 10,
    backgroundColor: 'color-basic-default',
    borderColor: 'color-basic-default',
  },
  icon: {
    color: 'text-basic-color',
    height: 14,
    width: 14,
    marginHorizontal: 10,
  },
  listHeaderTexts: {
    marginLeft: 10,
  },
  sortContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginHorizontal: 15,
  },
  sortBtnInner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortIcon: {
    width: 18,
    height: 18,
    marginRight: 5,
    fill: '#fff',
  },
  listHeaderBtns: {
    flexDirection: 'row',
    marginTop: 15,
  },
  listFooter: {
    alignItems: 'center',
    paddingVertical: 15,
  },
});
