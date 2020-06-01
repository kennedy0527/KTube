import React from 'react';
import {Icon, IconProps} from '@ui-kitten/components';
import {RenderProp} from '@ui-kitten/components/devsupport';

export const BackIcon: RenderProp<Partial<IconProps>> = (style) => (
  <Icon {...style} name="arrow-ios-back-outline" />
);
export const DownwardIcon: RenderProp<Partial<IconProps>> = (style) => (
  <Icon {...style} name="arrow-ios-downward-outline" />
);
export const VolumnOffIcon: RenderProp<Partial<IconProps>> = (style) => (
  <Icon {...style} name="volume-off-outline" />
);
export const VolumnUpIcon: RenderProp<Partial<IconProps>> = (style) => (
  <Icon {...style} name="volume-up-outline" />
);
export const HeartOutlineIcon: RenderProp<Partial<IconProps>> = (style) => (
  <Icon {...style} name="heart-outline" />
);
export const HeartIcon: RenderProp<Partial<IconProps>> = (style) => (
  <Icon {...style} name="heart" />
);
export const ArrowUpIcon: RenderProp<Partial<IconProps>> = (style) => (
  <Icon {...style} name="arrow-up-outline" />
);
export const ArrowDownIcon: RenderProp<Partial<IconProps>> = (style) => (
  <Icon {...style} name="arrow-down-outline" />
);
export const SignOutIcon: RenderProp<Partial<IconProps>> = (style) => (
  <Icon {...style} name="log-out-outline" />
);
export const LightIcon: RenderProp<Partial<IconProps>> = (style) => (
  <Icon {...style} name="sun-outline" />
);
export const DarkIcon: RenderProp<Partial<IconProps>> = (styles) => (
  <Icon {...styles} name="moon-outline" />
);

export const CloseIcon: RenderProp<Partial<IconProps>> = (style) => (
  <Icon {...style} name="close-outline" />
);
export const ClearIcon: RenderProp<Partial<IconProps>> = (style) => (
  <Icon {...style} name="close-circle" />
);
export const DownloadIcon: RenderProp<Partial<IconProps>> = (style) => (
  <Icon {...style} name="cloud-download-outline" />
);

export const PlayIcon: RenderProp<Partial<IconProps>> = (style) => (
  <Icon {...style} name="control-play" pack="simpleline" />
);
export const PauseIcon: RenderProp<Partial<IconProps>> = (style) => (
  <Icon {...style} name="control-pause" pack="simpleline" />
);
export const RewindIcon: RenderProp<Partial<IconProps>> = (style) => (
  <Icon {...style} name="control-rewind" pack="simpleline" />
);
export const ForwardIcon: RenderProp<Partial<IconProps>> = (style) => (
  <Icon {...style} name="control-forward" pack="simpleline" />
);
export const ShuffleIcon: RenderProp<Partial<IconProps>> = (style) => (
  <Icon {...style} name="shuffle" pack="simpleline" />
);
