import React, {
  useRef,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  Animated,
  StyleSheet,
  PanResponder,
  Dimensions,
  StatusBar,
  FlatList,
  Easing,
} from 'react-native';
import {hasNotch} from 'react-native-device-info';
import {useTheme} from '@ui-kitten/components';
import {LottieAnimationRef} from './lottieanimation';
import CurrentPlayingProvider from '../context/currentplaying-context';
import {
  CurrentPlayingViewContext,
  Types as CurrentPlayingViewTypes,
} from '../context/currentplayingview-context';
import VideosList from './videoslsit';
import PlayerView from './playerview';
import {VideoPlayerRef} from './videoplayer';
import useTraceUpdate from '../utils/usetraceupdate';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const deviceScreenHeight = hasNotch() ? screenHeight - 34 - 44 : screenHeight;

const deviceBottom = hasNotch() ? 44 : 0;

const bottomY = hasNotch() ? -50 : -25;

const dragStopY = hasNotch() ? 10 : 10;

const rangeMiddle = bottomY - 5;

const playerHeight = 300;

export default () => {
  const {visible, dispatch, videoItems, currentPlaying} = useContext(
    CurrentPlayingViewContext,
  );

  const usetheme = useTheme();
  const [isReverse, setIsReverse] = useState(false);
  const videoListRef = useRef<FlatList>(null);
  const videoPlayerRef = useRef<VideoPlayerRef>();
  const playingAnimRefs: LottieAnimationRef[] = [];

  const parentPanResponderSetOnMove = useRef(true);
  const panYAnim = useRef(new Animated.Value(50)).current;

  const [firstShow, setFirstShow] = useState(true);
  // useTraceUpdate({
  //   visible,
  //   // videoItems,
  //   currentPlaying,
  //   // isReverse,
  //   // firstShow,
  // });
  const playingViewTranslateYAnim = panYAnim.interpolate({
    inputRange: [-200, bottomY, -bottomY],
    outputRange: [
      deviceBottom,
      firstShow ? screenHeight : screenHeight - 100 + bottomY,
      screenHeight,
    ],
    extrapolate: 'clamp',
  });
  const playingViewShadowOpacityAnim = panYAnim.interpolate({
    inputRange: [-100, bottomY],
    outputRange: [0, 0.3],
    extrapolate: 'clamp',
  });
  const playingViewOpacityAnim = panYAnim.interpolate({
    inputRange: [bottomY, 100],
    outputRange: [1, firstShow ? 1 : 0],
    extrapolate: 'clamp',
  });
  const playingViewPaddingAnim = panYAnim.interpolate({
    inputRange: [bottomY - 50, rangeMiddle],
    outputRange: [0, firstShow ? 0 : 10],
    extrapolate: 'clamp',
  });
  const playingViewHeightAnim = panYAnim.interpolate({
    inputRange: [-200, firstShow ? -50 : rangeMiddle],
    outputRange: [deviceScreenHeight, firstShow ? deviceScreenHeight : 100],
    extrapolate: 'clamp',
  });
  const playerViewOpacityAnim = panYAnim.interpolate({
    inputRange: [-100, bottomY],
    outputRange: [1, firstShow ? 1 : 0],
    extrapolate: 'clamp',
  });
  const thumbnailWidthAnim = panYAnim.interpolate({
    inputRange: [bottomY - 50, rangeMiddle, bottomY],
    outputRange: [
      screenWidth,
      firstShow ? screenWidth : screenWidth - 20,
      firstShow ? screenWidth : 60,
    ],
    extrapolate: 'clamp',
  });
  const thumbnailHeightAnim = panYAnim.interpolate({
    inputRange: [-200, bottomY],
    outputRange: [playerHeight, firstShow ? playerHeight : 60],
    extrapolate: 'clamp',
  });
  const thumbnailScaleXAnim = thumbnailWidthAnim.interpolate({
    inputRange: [
      firstShow ? screenWidth : 60,
      firstShow ? screenWidth : screenWidth - 20,
      screenWidth,
    ],
    outputRange: [
      firstShow ? screenWidth / 60 : 1,
      firstShow ? screenWidth / 60 : (screenWidth - 20) / 60,
      screenWidth / 60,
    ],
    extrapolate: 'clamp',
  });
  const thumbnailScaleYAnim = thumbnailHeightAnim.interpolate({
    inputRange: [firstShow ? playerHeight : 60, playerHeight],
    outputRange: [firstShow ? playerHeight / 60 : 1, playerHeight / 60],
    extrapolate: 'clamp',
  });
  const thumbnailOpacityAnim = panYAnim.interpolate({
    inputRange: [rangeMiddle, bottomY],
    outputRange: [0, firstShow ? 0 : 1],
    extrapolate: 'clamp',
  });
  const thumbnailViewMarginAnim = panYAnim.interpolate({
    inputRange: [rangeMiddle, bottomY],
    outputRange: [0, 10],
    extrapolate: 'clamp',
  });
  const thumbnailViewBorderRadiusAnim = panYAnim.interpolate({
    inputRange: [rangeMiddle, bottomY],
    outputRange: [0, firstShow ? 0 : 10],
    extrapolate: 'clamp',
  });
  const controlOpacityAnim = panYAnim.interpolate({
    inputRange: [bottomY - 0.5, bottomY],
    outputRange: [0, firstShow ? 0 : 1],
    extrapolate: 'clamp',
  });
  const playListViewHeightAnim = panYAnim.interpolate({
    inputRange: [-200, rangeMiddle],
    outputRange: [deviceScreenHeight - playerHeight, 0],
    extrapolate: 'clamp',
  });
  const playListViewOpacityAnim = panYAnim.interpolate({
    inputRange: [-250, -200],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) =>
      !(gestureState.dx === 0 && gestureState.dy === 0) &&
      parentPanResponderSetOnMove.current,
    onPanResponderMove: (evt, gestureState) => {
      const y = bottomY + gestureState.dy;
      if (isReverse) {
        const reverseY = -250 + y;
        if (reverseY < bottomY) {
          panYAnim.setValue(reverseY);
        } else {
          panYAnim.setValue(bottomY);
        }
      } else {
        panYAnim.setValue(y);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy > dragStopY && !isReverse) {
        hide();
      } else if (gestureState.dy < -20 && !isReverse) {
        unfold();
      } else if (isReverse && gestureState.dy < 150) {
        Animated.spring(panYAnim, {
          toValue: -deviceScreenHeight,
          restSpeedThreshold: 100,
          restDisplacementThreshold: 40,
          useNativeDriver: false,
        }).start();
      } else {
        onPanMinify();
      }
    },
  });
  const setPanResponderEnable = useCallback((enable: boolean) => {
    parentPanResponderSetOnMove.current = enable;
  }, []);
  const unfold = () => {
    Animated.spring(panYAnim, {
      toValue: -deviceScreenHeight,
      restSpeedThreshold: 100,
      restDisplacementThreshold: 40,
      useNativeDriver: false,
    }).start(() => {
      // console.log('ENABLE REVERSE MODE');
      setIsReverse(true);
      !hasNotch() && StatusBar.setHidden(true, 'fade');
    });
  };
  const onPanMinify = () => {
    Animated.timing(panYAnim, {
      toValue: bottomY,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      // console.log('DISABLE REVERSE MODE');
      setIsReverse(false);
      !hasNotch() && StatusBar.setHidden(false, 'fade');
    });
  };
  const minify = useCallback(() => {
    Animated.timing(panYAnim, {
      toValue: bottomY,
      duration: 600,
      useNativeDriver: false,
    }).start(() => {
      // console.log('DISABLE REVERSE MODE');
      setIsReverse(false);
      !hasNotch() && StatusBar.setHidden(false, 'fade');
    });
  }, []);
  const hide = () => {
    Animated.spring(panYAnim, {
      toValue: 50,
      restSpeedThreshold: 100,
      restDisplacementThreshold: 40,
      useNativeDriver: false,
    }).start(() => {
      dispatch({type: CurrentPlayingViewTypes.Hide});

      setFirstShow(true);
    });
  };
  const getPlayingAnimRef = useCallback((index: number) => {
    return playingAnimRefs![index];
  }, []);
  const setPlayingAnimRef = useCallback((ref, index) => {
    if (ref !== null) {
      playingAnimRefs![index] = ref;
    }
  }, []);
  const setVideoPlayerRef = useCallback((ref) => {
    if (ref !== null) {
      videoPlayerRef!.current = ref;
    }
  }, []);

  useEffect(() => {
    if (visible && !isReverse && firstShow) {
      Animated.timing(panYAnim, {
        toValue: -deviceScreenHeight,
        duration: 700,
        delay: 0,
        easing: Easing.out(Easing.bezier(0.05, 0.96, 0.51, 0.97)),
        useNativeDriver: false,
      }).start(() => {
        videoPlayerRef.current &&
          videoPlayerRef.current!.getVideoUrl(currentPlaying.videoId);
        setIsReverse(true);
        !hasNotch() && StatusBar.setHidden(true, 'fade');
        setFirstShow(false);
      });
    } else if (visible) {
      videoPlayerRef.current &&
        videoPlayerRef.current!.getVideoUrl(currentPlaying.videoId);
    }
  }, [visible, currentPlaying, firstShow]);
  useEffect(() => {
    if (visible && !firstShow) {
      Animated.timing(panYAnim, {
        toValue: -deviceScreenHeight,
        duration: 500,
        easing: Easing.out(Easing.bezier(0, 0.55, 0.45, 1)),
        useNativeDriver: false,
      }).start(() => {
        videoPlayerRef.current &&
          videoPlayerRef.current!.getVideoUrl(currentPlaying.videoId);
        setIsReverse(true);
        !hasNotch() && StatusBar.setHidden(true, 'fade');
        setFirstShow(false);
      });
    }
  }, [videoItems]);
  const renderCurrentPlayingView = () => {
    if (visible) {
      return (
        <>
          <Animated.View
            style={[
              styles.currentPlayingView,
              {
                padding: playingViewPaddingAnim,
                opacity: playingViewOpacityAnim,
                transform: [{translateY: playingViewTranslateYAnim}],
                height: playingViewHeightAnim,
              },
            ]}
            {...panResponder.panHandlers}>
            <Animated.View
              style={[
                styles.currentPlayingViewInner,
                {
                  backgroundColor: usetheme['background-basic-color-1'],
                  shadowOpacity: playingViewShadowOpacityAnim,
                },
              ]}>
              <CurrentPlayingProvider
                videoItems={videoItems}
                currentPlaying={currentPlaying}>
                <PlayerView
                  setVideoPlayerRef={setVideoPlayerRef}
                  videoPlayerRef={videoPlayerRef}
                  videoListRef={videoListRef}
                  getPlayingAnimRef={getPlayingAnimRef}
                  setPanResponderEnable={setPanResponderEnable}
                  animationStyles={{
                    thumbnailViewMarginAnim,
                    thumbnailWidthAnim,
                    thumbnailHeightAnim,
                    thumbnailScaleXAnim,
                    thumbnailScaleYAnim,
                    thumbnailViewBorderRadiusAnim,
                    playerViewOpacityAnim,
                    thumbnailOpacityAnim,
                    controlOpacityAnim,
                  }}
                  minify={minify}
                />
              </CurrentPlayingProvider>
            </Animated.View>
          </Animated.View>
          <Animated.View
            style={[
              styles.playListView,
              hasNotch() ? {transform: [{translateY: -34}]} : {},
              {
                height: playListViewHeightAnim,
                opacity: playListViewOpacityAnim,
              },
            ]}>
            <VideosList
              videosListRef={videoListRef}
              videoPlayerRef={videoPlayerRef}
              videoItems={videoItems}
              getPlayingAnimRef={getPlayingAnimRef}
              setPlayingAnimRef={setPlayingAnimRef}
            />
          </Animated.View>
        </>
      );
    }
    return null;
  };
  return <>{renderCurrentPlayingView()}</>;
};
const styles = StyleSheet.create({
  currentPlayingView: {
    position: 'absolute',
    width: '100%',
    height: 100,
  },
  currentPlayingViewInner: {
    position: 'relative',
    flexDirection: 'row',
    backgroundColor: 'white',
    flex: 1,
    bottom: 0,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5.65,
    elevation: 8,
  },
  playListView: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    opacity: 0,
  },
});
