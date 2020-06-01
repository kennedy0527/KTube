import React, {useState, useImperativeHandle, useRef, forwardRef} from 'react';

import LottieView from 'lottie-react-native';
import type AnimatedLottieView from 'lottie-react-native';
import useTraceUpdate from '../utils/usetraceupdate';

type Props = {
  source: any;
  videoId: string;
  visible?: boolean;
};

export type LottieAnimationRef = {
  show: () => void;
  hide: () => void;
  play: () => void;
  reset: () => void;
};
const LottieAnimation = (props: Props, ref: any) => {
  const [visible, setVisible] = useState(props.visible || false);
  // useTraceUpdate({...props, visible});
  const lottieRef = useRef<AnimatedLottieView | null>();

  useImperativeHandle(ref, () => ({
    show,
    hide,
    play,
    reset,
    videoId: props.videoId,
  }));
  const show = () => {
    setVisible(true);
  };
  const hide = () => {
    setVisible(false);
  };
  const play = () => {
    lottieRef.current && lottieRef.current.play();
  };
  const reset = () => {
    lottieRef.current && lottieRef.current.reset();
  };

  return (
    <LottieView
      ref={(ref) => (lottieRef.current = ref)}
      style={[
        {position: 'relative', width: 30, marginRight: 5},
        visible ? {display: 'flex'} : {display: 'none'},
      ]}
      source={props.source}
      colorFilters={[
        {
          keypath: 'Path 7',
          color: '#e43f5a',
        },
        {
          keypath: 'Path 6',
          color: '#e43f5a',
        },
        {
          keypath: 'Path 8',
          color: '#e43f5a',
        },
      ]}
      loop
    />
  );
};
export default forwardRef(LottieAnimation);
