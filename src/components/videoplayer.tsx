import React, {
  useContext,
  useEffect,
  useState,
  RefObject,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
} from 'react';
import {
  StyleSheet,
  Alert,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import {Text} from '@ui-kitten/components';
import Video from 'react-native-video';
import {LottieAnimationRef} from './lottieanimation';
import {CurrentPlayingContext, Types} from '../context/currentplaying-context';
import {UserDataContext} from '../context/userdata-context';
import {formatTime} from '../utils/utils';
import {
  CurrentPlayingViewContext,
  Types as CurrentPlayingViewTypes,
} from '../context/currentplayingview-context';
import useYoutube from '../utils/useyoutube';
import {PlaylistItemType} from '../utils/usestorage';
import {
  PauseIcon,
  PlayIcon,
  RewindIcon,
  ForwardIcon,
  DownwardIcon,
  VolumnOffIcon,
  VolumnUpIcon,
} from './icons';
import LikeButton from '../components/likebutton';
import useTraceUpdate from '../utils/usetraceupdate';

const {width: screenWidth} = Dimensions.get('window');

const findIndex = (videoItems: PlaylistItemType[], videoId: string) => {
  return videoItems.map((item) => item.videoId).indexOf(videoId);
};

const calculateSeekerPosition = (currentTime: number, duration: number) => {
  const percent = currentTime / duration;
  return screenWidth * percent;
};

const calculateTimeFromSeekerPosition = (
  seekPosition: number,
  duration: number,
) => {
  const percent = seekPosition / screenWidth;
  return duration * percent;
};
type VideoPlayerProp = {
  playerRef: RefObject<Video>;
  getPlayingAnimRef: (index: number) => LottieAnimationRef;
  videoListRef: any;
  miniControllerRef: any;
  minify: () => void;
  setPanResponderEnable: (enable: boolean) => void;
};
export type VideoPlayerRef = {
  setPlayerStatus: (status: boolean) => void;
  getVideoUrl: (videoId: string) => void;
  hideCurrentAnim: () => void;
};

const VideoPlayer = (
  {
    playerRef,
    videoListRef,
    miniControllerRef,
    minify,
    setPanResponderEnable,
    getPlayingAnimRef,
  }: VideoPlayerProp,
  ref: any,
) => {
  const {videoItems, currentPlaying, dispatch} = useContext(
    CurrentPlayingContext,
  );
  const {dispatch: currentPlayingViewContextDispatch} = useContext(
    CurrentPlayingViewContext,
  );
  const {favorites} = useContext(UserDataContext);
  const [videoUrl, setVideoUrl] = useState('');

  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playableDuration, setPlayableDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const [seekOffset, setSeekOffset] = useState(0);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [toggleControls, setToggleControls] = useState(false);
  const {fetchWebPage, analyzeVideoUrl} = useYoutube();

  const opacityAnim = useRef(new Animated.Value(0)).current;
  const seekCircleZoomAnim = useRef(new Animated.Value(10)).current;
  const seekCircleBottomAnim = useRef(new Animated.Value(2)).current;
  const timerRef = useRef(0);
  /**
   * getVideoUrl AbortContoller
   */
  const gvuAbortControllerRef = useRef<AbortController | null>(null);
  /**
   * fetchWebPage AbortContoller
   */
  const fwpAbortControllerRef = useRef<AbortController | null>(null);
  /**
   * analyzeVideoUrl AbortContoller
   */
  const avuAbortControllerRef = useRef<AbortController | null>(null);
  /**
   * record getVideoUrl failed times
   */
  const getVideoUrlfailedTimes = useRef(0);
  /**
   * Seek Bar Pan Responder
   */
  const seekPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => toggleControls,
    onMoveShouldSetPanResponder: () => toggleControls,
    onPanResponderGrant: () => {
      zoomOnSeekCircle();
      setSeeking(true);
      setSeekOffset(seekPosition);
      setPanResponderEnable(false);
      if (!toggleControls) {
        showControls();
      }
      clearTimer();
    },
    onPanResponderMove: (evt, gestureState) => {
      setSeekPosition(gestureState.moveX);
      const time = calculateTimeFromSeekerPosition(seekPosition, duration);
      setCurrentTime(`-${formatTime(duration - time)}`);
    },
    onPanResponderRelease: () => {
      const time = calculateTimeFromSeekerPosition(seekPosition, duration);
      const prevtime = calculateTimeFromSeekerPosition(seekOffset, duration);
      if (time < duration && time !== prevtime) {
        playerRef.current!.seek(time);
      }
      zoomOutSeekCircle();
      setSeeking(false);
      setPanResponderEnable(true);
      setTimer();
    },
  });
  const {thumbnailUrl, title} = currentPlaying;
  useImperativeHandle(ref, () => ({
    setPlayerStatus,
    getVideoUrl,
    hideCurrentAnim,
  }));

  /**
   * React Native Video Props
   */
  const onLoad = ({duration}: {duration: number}) => {
    dispatch({
      type: Types.PlayerIsReadyChanged,
      isPlayerReady: true,
    });
    setDuration(duration);
    setCurrentTime(`-${formatTime(duration)}`);
    setIsPlaying(true);
  };
  const onLoadStart = () => {
    dispatch({
      type: Types.PlayerIsReadyChanged,
      isPlayerReady: false,
    });
    setSeekPosition(0);
    setDuration(0);
    setSeekOffset(0);
    setCurrentTime('00:00');
  };
  const onEnd = () => {
    onNext();
  };
  const onError = (error: any) => {
    const {videoUrl} = currentPlaying;
    console.error(videoUrl);
    console.error(error);
    Alert.alert(
      'Error',
      `${videoUrl}
      ${error}
      `,
      [{text: 'OK'}],
    );
  };
  const onProgress = ({
    currentTime,
    playableDuration,
    seekableDuration,
  }: {
    currentTime: number;
    playableDuration: number;
    seekableDuration: number;
  }) => {
    const time = duration - currentTime;
    if (!seeking) {
      setSeekPosition(calculateSeekerPosition(currentTime, duration));
      setCurrentTime(`-${formatTime(time)}`);
    }
    setPlayableDuration(calculateSeekerPosition(playableDuration, duration));
  };
  const onRemotePlay = () => {
    onPlay();
  };
  const onRemotePause = () => {
    onPause();
  };
  const onRemoteNext = () => {
    onNext();
  };
  const onRemotePrevious = () => {
    onPrevious();
  };
  const onPlaybackRateChange = useCallback(
    ({playbackRate}: {playbackRate: number}) => {
      switch (playbackRate) {
        case 0: {
          // console.log('Status: PAUSE', currentPlaying.videoId);
          const index = findIndex(videoItems, currentPlaying.videoId);
          const target = getPlayingAnimRef(index);
          target && target.reset();

          miniControllerRef.current &&
            miniControllerRef.current.setPlayerStatus(false);

          break;
        }
        case 1: {
          // console.log('Status: PLAY', currentPlaying.videoId);
          const index = findIndex(videoItems, currentPlaying.videoId);
          const target = getPlayingAnimRef(index);

          target && target.show();
          target && target.play();

          miniControllerRef.current &&
            miniControllerRef.current.setPlayerStatus(true);

          break;
        }
        default:
          break;
      }
    },
    [currentPlaying],
  );

  /**
   * Hide playing Animation
   */
  const hideCurrentAnim = useCallback(() => {
    const prevIndex = videoItems.findIndex(
      (item) => item.videoId === currentPlaying.videoId,
    );
    const target = getPlayingAnimRef(prevIndex);
    if (prevIndex !== -1 && target) {
      target.hide();
      target.reset();
    }
  }, [currentPlaying, videoItems]);
  /**
   * Get video URL
   * @param {string} videoId - video id
   */
  const getVideoUrl = async (videoId: string) => {
    try {
      if (gvuAbortControllerRef.current) {
        gvuAbortControllerRef.current.abort();

        gvuAbortControllerRef.current = null;
      }
      gvuAbortControllerRef.current = new AbortController();
      gvuAbortControllerRef.current!.signal.addEventListener('abort', () => {
        console.log('Aborted', videoId);
        const prevIndex = videoItems.findIndex(
          (item) => item.videoId === videoId,
        );
        const target = getPlayingAnimRef(prevIndex);
        if (prevIndex !== -1 && target) {
          target.hide();
          target.reset();
        }
      });
      if (fwpAbortControllerRef.current) {
        fwpAbortControllerRef.current.abort();
        fwpAbortControllerRef.current = null;
      }
      if (avuAbortControllerRef.current) {
        avuAbortControllerRef.current.abort();
        avuAbortControllerRef.current = null;
      }
      fwpAbortControllerRef.current = new AbortController();
      avuAbortControllerRef.current = new AbortController();

      const {playerScriptUrl, playerResp} = await fetchWebPage(
        videoId,
        fwpAbortControllerRef.current,
      );
      if (playerScriptUrl && playerResp) {
        const videoUrl = await analyzeVideoUrl(
          playerResp,
          playerScriptUrl,
          avuAbortControllerRef.current,
        );

        if (videoUrl) {
          setVideoUrl(videoUrl);
          // reset failed times
          getVideoUrlfailedTimes.current = 0;
          if (!isPlaying) {
            setIsPlaying(true);
          }
        }
      }
    } catch (error) {
      console.log(error);
      // if cannot get current video url and failed times are under 5 times, automatically play next video
      if (getVideoUrlfailedTimes.current <= 5) {
        getVideoUrlfailedTimes.current += 1;
        onNext();
      }
    } finally {
      fwpAbortControllerRef.current = null;
      avuAbortControllerRef.current = null;
      gvuAbortControllerRef.current = null;
    }
  };
  /**
   * Set player status
   * @param {boolean} status - status
   */
  const setPlayerStatus = (status: boolean) => {
    setIsPlaying(status);
  };
  /**
   * Change current playing video
   * @param index - video index
   */
  const changeCurrentPlaying = async (index: number) => {
    try {
      const {videoId, thumbnailUrl, title} = videoItems[index];

      if (videoListRef.current && index !== -1) {
        videoListRef.current.scrollToIndex({index});
      }
      hideCurrentAnim();
      const target = getPlayingAnimRef(index);
      target && target.show();

      currentPlayingViewContextDispatch({
        type: CurrentPlayingViewTypes.ChangeVideo,
        currentPlaying: {
          videoId,
          videoUrl: '',
          thumbnailUrl,
          title,
        },
      });
      await getVideoUrl(videoId);
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * Pause Event
   */
  const onPause = () => {
    setIsPlaying(false);
  };
  /**
   * Play Event
   */
  const onPlay = () => {
    setIsPlaying(true);
  };
  /**
   * Change to previous video
   */
  const onPrevious = async () => {
    try {
      const {videoId: currentPlayingID} = currentPlaying;
      let index = videoItems.findIndex(
        (item) => item.videoId === currentPlayingID,
      );
      if (index <= 0) {
        index = videoItems.length - 1;
      } else {
        index -= 1;
      }
      await changeCurrentPlaying(index);
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * Change to next video
   */
  const onNext = async () => {
    try {
      const {videoId: currentPlayingID} = currentPlaying;
      let index = videoItems.findIndex(
        (item) => item.videoId === currentPlayingID,
      );
      if (index >= videoItems.length - 1) {
        index = 0;
      } else {
        index += 1;
      }
      await changeCurrentPlaying(index);
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * Mini player mode
   */
  const onMinify = () => {
    minify();
    hideControls();
  };
  /**
   * Hide video controls
   */
  const hideControls = () => {
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setToggleControls(false);
    });
  };
  /**
   * Show video controls
   */
  const showControls = () => {
    setToggleControls(true);
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  /**
   * Toggle video controls
   */
  const onToggleControls = () => {
    if (toggleControls) {
      hideControls();
    } else {
      showControls();
    }
  };
  /**
   * Disable video muted
   */
  const onVolumnUp = () => {
    setMuted(false);
  };
  /**
   * Enable video muted
   */
  const onVolumnOff = () => {
    setMuted(true);
  };
  /**
   * seekbar circle zoom on animation
   */
  const zoomOnSeekCircle = () => {
    Animated.parallel([
      Animated.spring(seekCircleZoomAnim, {
        toValue: 15,
        useNativeDriver: false,
        restSpeedThreshold: 100,
        restDisplacementThreshold: 40,
      }),
      Animated.spring(seekCircleBottomAnim, {
        toValue: 0,
        useNativeDriver: false,
        restSpeedThreshold: 100,
        restDisplacementThreshold: 40,
      }),
    ]).start();
  };
  /**
   * seekbar circle zoom onut animation
   */
  const zoomOutSeekCircle = () => {
    Animated.parallel([
      Animated.spring(seekCircleZoomAnim, {
        toValue: 10,
        useNativeDriver: false,
        restSpeedThreshold: 100,
        restDisplacementThreshold: 40,
      }),
      Animated.spring(seekCircleBottomAnim, {
        toValue: 2,
        useNativeDriver: false,
        restSpeedThreshold: 100,
        restDisplacementThreshold: 40,
      }),
    ]).start();
  };
  /**
   * Hide video controls timer
   */
  const setTimer = () => {
    timerRef.current = setTimeout(() => {
      hideControls();
    }, 3000);
  };
  /**
   * Clear hide video controls timer
   */
  const clearTimer = () => {
    clearTimeout(timerRef.current);
  };
  /**
   * auto start hide controls timer when video is playing
   */
  useEffect(() => {
    if (toggleControls && isPlaying) {
      setTimer();
    }
    return () => clearTimer();
  }, [toggleControls, isPlaying]);
  /**
   * check video is in the favorites list or not
   * @returns {boolean} isLike
   */
  const isLike = useCallback(
    () =>
      favorites.videos.findIndex(
        (fitem) => fitem.videoId === currentPlaying.videoId,
      ) !== -1,
    [currentPlaying, favorites],
  );
  /**
   * get current playing item
   * @returns {object} current playing video
   */
  const getCurrentItem = useCallback(() => {
    const {videoId: currentPlayingID} = currentPlaying;
    let index = videoItems.findIndex(
      (item) => item.videoId === currentPlayingID,
    );
    return videoItems[index];
  }, [currentPlaying]);
  return useMemo(
    () => (
      <TouchableWithoutFeedback
        // key={currentPlaying.videoId}
        onPress={onToggleControls}>
        <View style={styles.videoContainer}>
          <Video
            // key={videoId}
            source={{uri: videoUrl}}
            controlCenter={{
              title,
              thumbnailURL: thumbnailUrl,
            }}
            poster={thumbnailUrl}
            ref={playerRef}
            onError={onError}
            onEnd={onEnd}
            onProgress={onProgress}
            onPlaybackRateChange={onPlaybackRateChange}
            onLoad={onLoad}
            onLoadStart={onLoadStart}
            onRemoteNext={onRemoteNext}
            onRemotePrevious={onRemotePrevious}
            onRemotePlay={onRemotePlay}
            onRemotePause={onRemotePause}
            style={styles.wrapper}
            playInBackground
            ignoreSilentSwitch={'ignore'}
            playWhenInactive
            paused={!isPlaying}
            muted={muted}
          />

          <Animated.View style={[styles.controls, {opacity: opacityAnim}]}>
            {toggleControls && (
              <>
                <View style={styles.topControl}>
                  <TouchableOpacity onPress={onMinify}>
                    <View style={styles.controlPanelButtonContainer}>
                      <DownwardIcon
                        style={styles.minifylIcon}
                        fill={'#F7F9FC'}
                      />
                    </View>
                  </TouchableOpacity>
                  <View style={styles.topLeftBtns}>
                    <View style={styles.btnContainer}>
                      <LikeButton
                        containerStyle={styles.controlPanelButtonContainer}
                        item={getCurrentItem()}
                        like={isLike()}
                        outlineFill={'#fff'}
                      />
                    </View>
                    <View style={styles.btnContainer}>
                      {muted ? (
                        <TouchableOpacity onPress={onVolumnUp}>
                          <View style={styles.controlPanelButtonContainer}>
                            <VolumnUpIcon
                              style={styles.volumnIcon}
                              fill={'#F7F9FC'}
                            />
                          </View>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity onPress={onVolumnOff}>
                          <View style={styles.controlPanelButtonContainer}>
                            <VolumnOffIcon
                              style={styles.volumnIcon}
                              fill={'#F7F9FC'}
                            />
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.midControl}>
                  <TouchableOpacity onPress={onPrevious}>
                    <View style={styles.controlPanelButtonContainer}>
                      <RewindIcon
                        style={[
                          styles.controlPanelIconSmall,
                          {color: '#F7F9FC'},
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                  {isPlaying ? (
                    <TouchableOpacity onPress={onPause}>
                      <View style={styles.controlPanelButtonContainer}>
                        <PauseIcon
                          style={[styles.controlPanelIcon, {color: '#F7F9FC'}]}
                        />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={onPlay}>
                      <View style={styles.controlPanelButtonContainer}>
                        <PlayIcon
                          style={[styles.controlPanelIcon, {color: '#F7F9FC'}]}
                        />
                      </View>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={onNext}>
                    <View style={styles.controlPanelButtonContainer}>
                      <ForwardIcon
                        style={[
                          styles.controlPanelIconSmall,
                          {color: '#F7F9FC'},
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={styles.bottomControl}>
                  <View style={styles.timeContainer}>
                    <View>
                      <Text
                        category={'c2'}
                        style={
                          styles.currentTimeContainer
                        }>{`${currentTime}`}</Text>
                    </View>
                    <View>
                      <Text
                        category={'c2'}
                        style={{
                          color: '#8F9BB3',
                        }}>{` / ${formatTime(duration)}`}</Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </Animated.View>
          <View
            style={[styles.seekContainer]}
            {...seekPanResponder.panHandlers}>
            <View style={[styles.seekBar, {width: seekPosition}]}></View>
            <View
              style={[
                styles.seekBarSeekable,
                {width: playableDuration},
              ]}></View>
            <View style={styles.seekBarFill}></View>
          </View>
          {toggleControls && (
            <Animated.View
              style={[
                styles.seekCircle,
                {
                  left: seekPosition,
                  opacity: opacityAnim,
                  width: seekCircleZoomAnim,
                  height: seekCircleZoomAnim,
                  bottom: seekCircleBottomAnim,
                },
              ]}></Animated.View>
          )}
        </View>
      </TouchableWithoutFeedback>
    ),
    [
      isPlaying,
      currentPlaying,
      videoUrl,
      toggleControls,
      currentTime,
      duration,
      playableDuration,
      seekPosition,
      seeking,
      seekOffset,
      muted,
      favorites,
    ],
  );
};
const styles = StyleSheet.create({
  wrapper: {
    height: 294,
    width: '100%',
    backgroundColor: 'black',
  },
  videoContainer: {
    position: 'relative',
    height: 300,
    width: '100%',
  },
  controls: {
    position: 'absolute',
    height: 294,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,.5)',
  },
  topControl: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  midControl: {
    flex: 4,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bottomControl: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  currentTimeContainer: {
    width: 60,
    textAlign: 'right',
    color: '#E4E9F2',
  },
  seekContainer: {
    position: 'absolute',
    zIndex: 5,
    bottom: 1,
    height: 20,
    // backgroundColor: 'rgba(180,180,180,.5)',
    width: '100%',
  },
  seekCircle: {
    position: 'absolute',
    marginLeft: -5,
    zIndex: 10,
    borderRadius: 30,
    backgroundColor: '#e43f5a',
  },
  seekBarFill: {
    position: 'absolute',
    bottom: 5,
    zIndex: 2,
    height: 2,
    backgroundColor: 'rgba(180,180,180,.5)',
    width: '100%',
  },
  seekBarSeekable: {
    position: 'absolute',
    bottom: 5,
    zIndex: 3,
    height: 2,
    backgroundColor: 'rgba(255,255,255,.5)',
  },
  seekBar: {
    position: 'absolute',
    bottom: 5,
    zIndex: 5,
    height: 2,
    backgroundColor: '#e43f5a',
  },
  topLeftBtns: {
    paddingHorizontal: 10,
    flexDirection: 'row',
  },
  btnContainer: {},
  volumnIcon: {
    height: 20,
    width: 20,
  },
  minifylIcon: {
    height: 25,
    width: 25,
  },
  controlPanelButtonContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  controlPanelIcon: {
    height: 40,
    width: 40,
  },
  controlPanelIconSmall: {
    height: 28,
    width: 28,
  },
});

export default forwardRef(VideoPlayer);
