import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  memo,
  RefObject,
  useMemo,
  useCallback,
} from 'react';
import {
  SafeAreaView,
  View,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Layout,
  Text,
  useTheme,
  List,
  ListItem,
  TopNavigationAction,
  Button,
  StyleService,
  useStyleSheet,
} from '@ui-kitten/components';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import FastImage from 'react-native-fast-image';
import {format} from 'date-fns';
import {hasNotch} from 'react-native-device-info';
import CustomeTopNavigation from '../components/customtopnaviagtion';
import useYoutube from '../utils/useyoutube';
import {
  PlaylistsStorage,
  PlaylistItemType,
  FavoritesType,
  getPlaylists,
  savePlaylist,
} from '../utils/usestorage';
import {shuffle, formatTime} from '../utils/utils';
import {
  BackIcon,
  ShuffleIcon,
  PlayIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '../components/icons';
import LikeButton from '../components/likebutton';
import useTraceUpdate from '../utils/usetraceupdate';
import {
  CurrentPlayingViewContext,
  Types,
} from '../context/currentplayingview-context';
import {UserDataContext} from '../context/userdata-context';
import {UserSettingContext} from '../context/usersetting-context';
import {RootStackParamList} from '../navigation/navigation';

const listFootMarginBottom = hasNotch() ? 100 + 34 : 100 + 34;

type VideosScreenRouteProp = RouteProp<RootStackParamList, 'Videos'>;

type VideosScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Videos'
>;
type Props = {
  route: VideosScreenRouteProp;
  navigation: VideosScreenNavigationProp;
};

type VideoRowProps = {
  onPress: (videoId: string) => void;
  like: boolean;
} & PlaylistItemType;

const VideoRow = ({
  thumbnailUrl,
  title,
  videoId,
  videoTimeLength,
  onPress,
  like,
}: VideoRowProps) => {
  const styles = useStyleSheet(themedStyles);
  // console.log('rows');
  // useTraceUpdate({thumbnailUrl, title, videoId, videoTimeLength, onPress});
  return useMemo(
    () => (
      <ListItem
        style={styles.listItem}
        title={() => (
          <Text style={{marginHorizontal: 8}} numberOfLines={2} category={'s2'}>
            {title}
          </Text>
        )}
        onPress={() => onPress(videoId)}
        accessoryLeft={() => (
          <Layout style={styles.playlistItemImageContainer}>
            <FastImage
              style={styles.videoThumbnail}
              source={{
                uri: thumbnailUrl,
              }}
            />
            <View style={styles.videoLength}>
              <Text category={'s2'} style={styles.videoLengthText}>
                {formatTime(videoTimeLength)}
              </Text>
            </View>
          </Layout>
        )}
        accessoryRight={() => (
          <LikeButton
            item={{thumbnailUrl, title, videoId, videoTimeLength}}
            like={like}
          />
        )}
      />
    ),
    [thumbnailUrl, title, videoId, videoTimeLength, onPress],
  );
};

type VideosListProps = {
  videoItems: Array<any>;
  listRef: RefObject<List>;
  isFetching: boolean;
  onRefresh: () => void;
  playlistTitle: string;
  playlistDateTime: Date | string;
  onPlayPress: () => void;
  onShufflePress: () => void;
  visible: boolean;
  fetchWebPage: (
    videoId: string,
  ) => Promise<
    | {playerScriptUrl: string; playerResp: any}
    | {playerScriptUrl: undefined; playerResp: undefined}
  >;
  analyzeVideoUrl: (resp: any, scriptUrl: string) => void;
  dispatch: React.Dispatch<any>;
  favorites: FavoritesType;
};
function propsAreEqual(prev: VideosListProps, next: VideosListProps) {
  if (prev.isFetching !== next.isFetching) {
    return false;
  }
  if (prev.videoItems !== next.videoItems) {
    return false;
  }
  if (prev.playlistDateTime !== next.playlistDateTime) {
    return false;
  }
  if (prev.playlistTitle !== next.playlistTitle) {
    return false;
  }
  return true;
}

const VideosList = memo(
  ({
    videoItems,
    listRef,
    isFetching,
    onRefresh,
    playlistTitle,
    playlistDateTime,
    onPlayPress,
    onShufflePress,
    visible,
    dispatch,
    favorites,
  }: VideosListProps) => {
    const usetheme = useTheme();
    const styles = useStyleSheet(themedStyles);
    const onPress = useCallback(
      async (videoId: string) => {
        try {
          const videos = [...videoItems];
          const nextPlayItem = videos.filter(
            (video) => video.videoId === videoId,
          )[0];
          const {thumbnailUrl, title} = nextPlayItem;
          shuffle(videos);

          const pressItemIndex = videos.findIndex(
            (video) => video.videoId === videoId,
          );
          videos.splice(pressItemIndex, 1);

          dispatch({
            type: Types.Show,
            videoItems: [nextPlayItem, ...videos],
            currentPlaying: {
              videoId,
              videoUrl: '',
              thumbnailUrl,
              title,
            },
          });
        } catch (error) {
          console.error(error);
          Alert.alert('Error', `${error}`, [{text: 'OK'}]);
        }
      },
      [videoItems],
    );
    const renderVideos = ({item}: any) => {
      const {thumbnailUrl, title, videoId, videoTimeLength} = item;
      return (
        <VideoRow
          key={videoId}
          like={
            favorites.videos.findIndex((item) => item.videoId === videoId) !==
            -1
          }
          videoId={videoId}
          title={title}
          thumbnailUrl={thumbnailUrl}
          videoTimeLength={videoTimeLength}
          onPress={onPress}
        />
      );
    };
    return (
      <List
        style={styles.list}
        keyExtractor={(item) => item.videoId}
        ref={listRef}
        data={videoItems}
        renderItem={renderVideos}
        initialNumToRender={8}
        maxToRenderPerBatch={2}
        refreshControl={
          <RefreshControl
            tintColor={usetheme['text-hint-color']}
            refreshing={isFetching}
            onRefresh={onRefresh}
          />
        }
        ListHeaderComponent={() => (
          <Layout style={styles.listHeader}>
            <Layout style={styles.listHeaderTexts}>
              <Text category="h2">{playlistTitle}</Text>
              <Text
                category="s2"
                appearance="hint"
                style={styles.listHeaderDescText}>
                Updated at{' '}
                {format(new Date(playlistDateTime), 'yyyy-MM-dd HH:mm:ss')}
              </Text>
            </Layout>

            <Layout style={styles.listHeaderBtns}>
              <Button
                style={styles.controlBtns}
                activeOpacity={0.5}
                status="primary"
                onPress={onPlayPress}
                accessoryLeft={() => <PlayIcon style={styles.controlIcon} />}>
                {() => <Text category="s1">Play</Text>}
              </Button>
              <Button
                style={styles.controlBtns}
                activeOpacity={0.5}
                status="primary"
                onPress={onShufflePress}
                accessoryLeft={() => (
                  <ShuffleIcon style={styles.controlIcon} />
                )}>
                {() => <Text category="s1">Shuffle</Text>}
              </Button>
            </Layout>
          </Layout>
        )}
        ListFooterComponent={() => (
          <Layout
            style={[
              styles.listFooter,
              visible ? {marginBottom: listFootMarginBottom} : {},
            ]}>
            <Text>{`Total ${videoItems.length} videos`}</Text>
          </Layout>
        )}
      />
    );
  },
  propsAreEqual,
);
export default ({route, navigation}: Props): React.ReactElement => {
  const usetheme = useTheme();
  const styles = useStyleSheet(themedStyles);
  const [videoItems, setVideoItems] = useState<PlaylistItemType[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const {
    fetchPlaylistItems,
    fetchWebPage,
    analyzeVideoUrl,
    analyzeVideoInfo,
  } = useYoutube();
  const {playlistId, title, thumbnail, dateTime} = route.params;
  const [playlistTitle, setPlaylistTitle] = useState<string>(title);
  const [playlistDateTime, setPlaylistDateTime] = useState<Date | string>(
    dateTime,
  );
  const {visible, currentPlaying, dispatch} = useContext(
    CurrentPlayingViewContext,
  );
  const {favorites} = useContext(UserDataContext);

  const listRef = useRef<List>(null);
  useEffect(() => {
    // setIsFetching(true);
    getPlaylistsFromStorage();
  }, []);

  const getPlaylistsFromStorage = async () => {
    try {
      const playlists = await getPlaylists();

      playlists.forEach(async (playlist: PlaylistsStorage) => {
        if (playlist.id === playlistId) {
          const {playlistItems, title, dateTime: pDateTime} = playlist;
          setVideoItems(playlistItems);

          setPlaylistTitle(title);
          setPlaylistDateTime(pDateTime || dateTime);
          setIsFetching(false);
        }
      });
    } catch (error) {
      setIsFetching(false);
      console.log(error);
    }
  };
  const goBack = () => {
    navigation.goBack();
  };
  const onRefresh = async () => {
    try {
      setIsFetching(true);
      const playlistItems = (await fetchPlaylistItems(playlistId)) || [];

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
      // console.time();
      const promises = playlistItems.map((playlistItem) =>
        getVideoIndo(playlistItem.contentDetails.videoId),
      );
      const videosInfo = await Promise.all(promises);

      const notUndefined = (
        value: PlaylistItemType | undefined,
      ): value is PlaylistItemType => {
        return value !== undefined;
      };

      const videos = videosInfo.filter(notUndefined);
      // console.log(videos.filter(Boolean));
      // console.timeEnd();
      setIsFetching(false);
      if (videos) {
        await savePlaylist({
          id: playlistId,
          title,
          thumbnail,
          playlistItems: videos,
        });
      }

      await getPlaylistsFromStorage();
    } catch (error) {
      setIsFetching(false);
      console.log(error);
    }
  };

  const CustomBackAction = (): React.ReactElement => (
    <TouchableOpacity onPress={goBack}>
      <Layout style={styles.backActionContainer}>
        <BackIcon style={styles.backIcon} fill={usetheme['text-basic-color']} />
        <Text category={'s1'}>Home</Text>
      </Layout>
    </TouchableOpacity>
  );

  const onPlayPress = async () => {
    try {
      const {videoId, thumbnailUrl, title} = videoItems[0];
      if (videoId !== currentPlaying.videoId) {
        dispatch({
          type: Types.Show,
          videoItems,
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
  };
  const onShufflePress = async () => {
    try {
      const videos = [...videoItems];

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
  };

  return (
    <>
      <SafeAreaView style={styles.wrapper}>
        <Layout style={styles.container}>
          <CustomeTopNavigation
            customLeft={CustomBackAction}
            title="Home"
            alignment="start"
          />
          <VideosList
            listRef={listRef}
            videoItems={videoItems}
            isFetching={isFetching}
            onRefresh={onRefresh}
            playlistTitle={playlistTitle}
            playlistDateTime={playlistDateTime}
            onPlayPress={onPlayPress}
            onShufflePress={onShufflePress}
            fetchWebPage={fetchWebPage}
            analyzeVideoUrl={analyzeVideoUrl}
            dispatch={dispatch}
            visible={visible}
            favorites={favorites}
          />
        </Layout>
      </SafeAreaView>
    </>
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
    justifyContent: 'center',
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
  videoThumbnail: {
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 10,
  },
  playlistItemImageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: 'black',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,

    elevation: 8,
  },
  videoLength: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 2,
    borderRadius: 5,
  },
  videoLengthText: {color: 'white'},
  list: {
    flex: 1,
    backgroundColor: 'background-basic-color-1',
  },
  listItem: {
    paddingHorizontal: 18,
  },
  listHeader: {
    marginTop: 5,
    marginHorizontal: 8,
  },
  listHeaderTexts: {
    marginHorizontal: 8,
  },
  listHeaderDescText: {
    marginTop: 5,
  },
  listHeaderBtns: {
    flexDirection: 'row',
    marginTop: 15,
  },
  listFooter: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  controlBtns: {
    flex: 1,
    margin: 10,
    backgroundColor: 'color-basic-default',
    borderColor: 'color-basic-default',
  },
  controlIcon: {
    color: 'text-basic-color',
    height: 14,
    width: 14,
    marginHorizontal: 10,
  },
});
