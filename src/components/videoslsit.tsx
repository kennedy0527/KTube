import React, {
  useEffect,
  useMemo,
  memo,
  RefObject,
  useRef,
  useContext,
  forwardRef,
  useLayoutEffect,
  MutableRefObject,
} from 'react';
import {View, StyleSheet, FlatList} from 'react-native';
import {useTheme, ListItem, Text, Layout} from '@ui-kitten/components';
import FastImage from 'react-native-fast-image';
import LottieAnimation, {LottieAnimationRef} from './lottieanimation';
import {
  CurrentPlayingViewContext,
  Types as CurrentPlayingViewTypes,
} from '../context/currentplayingview-context';
import {VideoPlayerRef} from './videoplayer';
import useTraceUpdate from '../utils/usetraceupdate';

type VideoRowProps = {
  item: {
    thumbnailUrl: string;
    title: string;
    videoTimeLength: string;
    videoId: string;
  };
  onPlaylisitemPress: (item: any, index: number) => void;
  setPlayingAnimRef: (ref: LottieAnimationRef, index: number) => void;
  index: number;
};

const VideoRow = memo((props: VideoRowProps) => {
  const {item, onPlaylisitemPress, index} = props;

  const {thumbnailUrl, title, videoId} = item;
  const titleComponent = () => (
    <Layout style={styles.videoTitleContainer}>
      <LottieAnimation
        ref={(ref: LottieAnimationRef) => props.setPlayingAnimRef(ref, index)}
        videoId={videoId}
        visible={index === 0}
        source={require('../assets/playinganimation.json')}
      />
      <Layout style={styles.videoTitle}>
        <Text numberOfLines={2} category={'s2'}>{`${title}`}</Text>
      </Layout>
    </Layout>
  );
  const accessoryLeft = () => (
    <View style={styles.thumbnailView}>
      <FastImage
        style={styles.thumbnail}
        source={{
          uri: thumbnailUrl,
        }}
      />
    </View>
  );
  return (
    <ListItem
      style={styles.videoRow}
      accessoryLeft={accessoryLeft}
      onPress={() => onPlaylisitemPress(item, index)}
      accessoryRight={() => (
        <Layout style={styles.videoLengthContainer}>
          <Text category="s2" appearance={'hint'}>
            {item.videoTimeLength}
          </Text>
        </Layout>
      )}
      title={titleComponent}
    />
  );
});

type Props = {
  videosListRef: any;
  videoItems: Array<{
    videoId: string;
    title: string;
    videoTimeLength: string;
    thumbnails: string;
  }>;
  setPlayingAnimRef: (ref: LottieAnimationRef, index: number) => void;
  getPlayingAnimRef: (index: number) => LottieAnimationRef;
  videoPlayerRef: MutableRefObject<VideoPlayerRef | undefined>;
};
export default ({
  videosListRef,
  videoItems,
  setPlayingAnimRef,
  getPlayingAnimRef,
  videoPlayerRef,
}: Props) => {
  useTraceUpdate({
    videosListRef,
    videoItems,
    videoPlayerRef,
    setPlayingAnimRef,
  });

  const {dispatch} = useContext(CurrentPlayingViewContext);
  const onPlaylisitemPress = async (
    {
      videoId,
      title,
      thumbnailUrl,
    }: {
      videoId: string;
      title: string;
      thumbnailUrl: string;
    },
    index: number,
  ) => {
    try {
      videosListRef.current.scrollToIndex({index});

      const target = getPlayingAnimRef(index);
      target && target.show();
      videoPlayerRef.current && videoPlayerRef.current.hideCurrentAnim();
      dispatch({
        type: CurrentPlayingViewTypes.ChangeVideo,
        currentPlaying: {
          videoId,
          videoUrl: '',
          thumbnailUrl,
          title,
        },
      });

      videoPlayerRef.current && videoPlayerRef.current.getVideoUrl(videoId);
    } catch (error) {
      console.log(error);
    }
  };

  const renderItem = ({item, index}: {item: any; index: number}) => {
    return (
      <VideoRow
        key={item.videoId}
        index={index}
        item={item}
        onPlaylisitemPress={onPlaylisitemPress}
        setPlayingAnimRef={setPlayingAnimRef}
      />
    );
  };

  useEffect(() => {
    videosListRef.current.scrollToIndex({index: 0});
  }, [videoItems]);

  return useMemo(
    () => (
      <FlatList
        style={styles.wrapper}
        keyExtractor={(item) => item.videoId}
        ref={videosListRef}
        data={videoItems}
        renderItem={renderItem}
        onScrollToIndexFailed={(error: any) => {
          console.log(error);
        }}
        getItemLayout={(data: any, index: number) => ({
          length: 75,
          offset: 75 * index,
          index,
        })}
        ListFooterComponent={() => (
          <Layout style={styles.listFooter}>
            <Text>{`Total ${videoItems.length} videos`}</Text>
          </Layout>
        )}
        initialNumToRender={8}
        maxToRenderPerBatch={2}
      />
    ),
    [videoItems],
  );
};
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    marginHorizontal: 10,
  },
  thumbnail: {width: '100%', height: '100%'},
  thumbnailView: {
    position: 'relative',
    width: 100,
    height: 55,
    marginRight: 10,
  },
  videoLength: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 2,
    backgroundColor: 'rgba(0,0,0,.5)',
  },
  videoLengthContainer: {
    marginLeft: 8,
    backgroundColor: 'transparent',
  },
  videoRow: {height: 75},
  videoTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  videoTitle: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  listFooter: {
    alignItems: 'center',
    padding: 15,
  },
});
