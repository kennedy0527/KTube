import React, {useCallback, useEffect} from 'react';
import {StyleSheet, Dimensions, Alert, FlatList} from 'react-native';
import {
  Layout,
  Text,
  ListItem,
  Divider,
  StyleService,
  useStyleSheet,
} from '@ui-kitten/components';
import FastImage from 'react-native-fast-image';
import {hasNotch} from 'react-native-device-info';
import {PlaylistItemType} from '../utils/usestorage';
import {Types} from '../context/currentplayingview-context';
import {shuffle} from '../utils/utils';
import LikeButton from '../components/likebutton';
import {formatTime} from '../utils/utils';

const listFootMarginBottom = hasNotch() ? 100 + 34 : 100;
const {width: screenWidth} = Dimensions.get('window');

type Props = {
  favorites: PlaylistItemType[];
  visible: boolean;
  dispatch: React.Dispatch<{}>;
  ListHeaderComponent?: React.FunctionComponent<{}>;
  ListFooterComponent?: React.FunctionComponent<{}>;
  showHeart?: boolean;
};
export default (props: Props) => {
  const styles = useStyleSheet(themedStyles);
  const {
    favorites,
    dispatch,
    visible,
    ListHeaderComponent,
    showHeart,
    ListFooterComponent,
  } = props;
  const onItemPress = useCallback(
    async (videoId: string) => {
      try {
        const videos = [...favorites];
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
    [favorites],
  );

  const renderFavorites = ({item}: {item: PlaylistItemType}) => {
    return (
      <ListItem
        style={styles.listItem}
        title={() => (
          <Text category="s2" style={styles.itemTitle} numberOfLines={2}>
            {item.title}
          </Text>
        )}
        onPress={() => onItemPress(item.videoId)}
        accessoryLeft={() => (
          <Layout style={styles.thumbnailContainer}>
            <FastImage
              style={styles.thumbnail}
              source={{uri: item.thumbnailUrl}}
              resizeMode={'cover'}
            />
          </Layout>
        )}
        accessoryRight={() =>
          !showHeart ? (
            <Layout style={styles.videoLengthContainer}>
              <Text category="s2" appearance={'hint'}>
                {formatTime(item.videoTimeLength)}
              </Text>
            </Layout>
          ) : (
            <LikeButton
              item={item}
              like={
                favorites.findIndex(
                  (fitem) => fitem.videoId === item.videoId,
                ) !== -1
              }
            />
          )
        }
      />
    );
  };
  const keyExtractor = (item: PlaylistItemType) => item.videoId;
  return (
    <FlatList
      keyExtractor={keyExtractor}
      contentContainerStyle={{flexGrow: 1}}
      style={styles.favoritesList}
      data={favorites}
      ItemSeparatorComponent={() => <Divider style={styles.divider} />}
      renderItem={renderFavorites}
      ListHeaderComponent={ListHeaderComponent || null}
      ListFooterComponent={() => (
        <Layout
          style={[
            styles.listFooter,
            visible ? {marginBottom: listFootMarginBottom} : {},
          ]}>
          {ListFooterComponent ? <ListFooterComponent /> : null}
        </Layout>
      )}
      ListEmptyComponent={() => (
        <Layout style={styles.emptyContainer}>
          <Layout style={styles.emptyTextContainer}>
            <Text category={'h6'} appearance="hint">
              Favorites are empty.
            </Text>
            <Text category={'s2'} appearance="hint">
              Please add videos from imported playlists.
            </Text>
          </Layout>
        </Layout>
      )}
    />
  );
};
const themedStyles = StyleService.create({
  listItem: {
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  itemTitle: {marginHorizontal: 8},
  thumbnailContainer: {
    height: 60,
    width: 60,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,

    elevation: 4,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  videoLengthContainer: {
    backgroundColor: 'transparent',
    marginLeft: 8,
  },
  favoritesList: {
    flex: 1,
    backgroundColor: 'background-basic-color-1',
  },
  divider: {
    backgroundColor: 'border-favorite-color',
    height: StyleSheet.hairlineWidth,
    width: screenWidth - 96,
    alignSelf: 'flex-end',
    marginHorizontal: 10,
  },
  listFooter: {alignItems: 'center', padding: 15},
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTextContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
