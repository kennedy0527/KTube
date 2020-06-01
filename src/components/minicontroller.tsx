import React, {
  useContext,
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {useTheme} from '@ui-kitten/components';
import {PauseIcon, PlayIcon} from './icons';
import {CurrentPlayingContext, Types} from '../context/currentplaying-context';

const MiniContorller = (
  {
    playerRef,
  }: {
    playerRef: any;
  },
  ref: any,
) => {
  const {isPlayerReady} = useContext(CurrentPlayingContext);
  const [isPlaying, setIsPlaying] = useState(true);
  const usetheme = useTheme();
  useImperativeHandle(ref, () => ({
    setPlayerStatus,
  }));
  const play = () => {
    playerRef.current && playerRef.current.setPlayerStatus(true);
  };
  const pause = () => {
    playerRef.current && playerRef.current.setPlayerStatus(false);
  };
  const setPlayerStatus = (isPlaying: boolean) => {
    setIsPlaying(isPlaying);
  };
  return useMemo(
    () => (
      <>
        {isPlaying && isPlayerReady ? (
          <TouchableOpacity onPress={pause} disabled={!isPlayerReady}>
            <View style={styles.controlPanelButtonContainer}>
              <PauseIcon
                style={[
                  styles.controlPanelIcon,
                  isPlayerReady
                    ? {color: usetheme['text-basic-color']}
                    : {color: usetheme['color-basic-disabled']},
                ]}
              />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={play} disabled={!isPlayerReady}>
            <View style={styles.controlPanelButtonContainer}>
              <PlayIcon
                style={[
                  styles.controlPanelIcon,
                  isPlayerReady
                    ? {color: usetheme['text-basic-color']}
                    : {color: usetheme['color-basic-disabled']},
                ]}
              />
            </View>
          </TouchableOpacity>
        )}
      </>
    ),
    [isPlaying, isPlayerReady],
  );
};

const styles = StyleSheet.create({
  controlPanelContainer: {
    justifyContent: 'center',
  },
  controlPanelButtonContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlPanelIcon: {
    height: 20,
  },
});

export default forwardRef(MiniContorller);
