import React, {useRef, useContext} from 'react';
import {Animated, StyleSheet, Dimensions, View} from 'react-native';
import Video from 'react-native-video';
import {LottieAnimationRef} from './lottieanimation';
import {useTheme} from '@ui-kitten/components';
import TextTicker from 'react-native-text-ticker';
import MiniController from './minicontroller';
import VideoPlayer from './videoplayer';
import {CurrentPlayingContext} from '../context/currentplaying-context';

const {width: screenWidth} = Dimensions.get('window');

type Props = {
  videoPlayerRef: any;
  videoListRef: any;
  getPlayingAnimRef: (index: number) => LottieAnimationRef;
  animationStyles: {
    thumbnailViewMarginAnim: Animated.AnimatedInterpolation;
    thumbnailWidthAnim: Animated.AnimatedInterpolation;
    thumbnailHeightAnim: Animated.AnimatedInterpolation;
    thumbnailScaleXAnim: Animated.AnimatedInterpolation;
    thumbnailScaleYAnim: Animated.AnimatedInterpolation;
    thumbnailViewBorderRadiusAnim: Animated.AnimatedInterpolation;
    playerViewOpacityAnim: Animated.AnimatedInterpolation;
    thumbnailOpacityAnim: Animated.AnimatedInterpolation;
    controlOpacityAnim: Animated.AnimatedInterpolation;
  };
  minify: () => void;
  setPanResponderEnable: (enable: boolean) => void;
  setVideoPlayerRef: (ref: any) => void;
};
export default ({
  videoPlayerRef,
  videoListRef,
  animationStyles,
  minify,
  setPanResponderEnable,
  getPlayingAnimRef,
  setVideoPlayerRef,
}: Props) => {
  const {currentPlaying} = useContext(CurrentPlayingContext);
  const ytRef = useRef<Video>(null);
  // const videoPlayerRef = useRef();
  const miniControllerRef = useRef();
  const usetheme = useTheme();
  const {
    thumbnailViewMarginAnim,
    thumbnailWidthAnim,
    thumbnailHeightAnim,
    thumbnailScaleXAnim,
    thumbnailScaleYAnim,
    thumbnailViewBorderRadiusAnim,
    playerViewOpacityAnim,
    thumbnailOpacityAnim,
    controlOpacityAnim,
  } = animationStyles;
  const {thumbnailUrl, title} = currentPlaying;
  return (
    <>
      <Animated.View
        style={[
          styles.currentPlayingImageContainer,
          {
            margin: thumbnailViewMarginAnim,
            width: thumbnailWidthAnim,
            height: thumbnailHeightAnim,
            borderRadius: thumbnailViewBorderRadiusAnim,
          },
        ]}>
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            opacity: playerViewOpacityAnim,
            width: screenWidth,
            height: 300,
            zIndex: 2,
          }}>
          <VideoPlayer
            ref={(ref) => setVideoPlayerRef(ref)}
            getPlayingAnimRef={getPlayingAnimRef}
            playerRef={ytRef}
            videoListRef={videoListRef}
            miniControllerRef={miniControllerRef}
            minify={minify}
            setPanResponderEnable={setPanResponderEnable}
          />
        </Animated.View>

        <Animated.Image
          style={[
            styles.videoThumbnail,
            {
              transform: [
                {
                  scaleX: thumbnailScaleXAnim,
                },
                {
                  scaleY: thumbnailScaleYAnim,
                },
              ],
              width: 60,
              height: 60,
              opacity: thumbnailOpacityAnim,
            },
          ]}
          source={{
            uri: thumbnailUrl,
          }}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.currentPlayingTitleContainer,
          {
            opacity: controlOpacityAnim,
          },
        ]}>
        <TextTicker
          style={{color: usetheme['text-basic-color']}}
          duration={10000}
          loop
          bounce={false}
          marqueeDelay={1000}>
          {title}
        </TextTicker>
      </Animated.View>
      <Animated.View
        style={[
          styles.controlPanelContainer,
          {
            opacity: controlOpacityAnim,
          },
        ]}>
        <MiniController playerRef={videoPlayerRef} ref={miniControllerRef} />
      </Animated.View>
    </>
  );
};
const styles = StyleSheet.create({
  wrapper: {
    height: '100%',
  },
  videoThumbnail: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    resizeMode: 'cover',
    borderRadius: 10,
  },
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
  currentPlayingImageContainer: {
    position: 'relative',
    top: 0,
    margin: 10,
    overflow: 'hidden',
    width: 60,
    height: 60,
    backgroundColor: 'transparent',
  },
  currentPlayingTitleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  controlPanelContainer: {
    justifyContent: 'center',
  },
  playListView: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    opacity: 0,
  },
});
