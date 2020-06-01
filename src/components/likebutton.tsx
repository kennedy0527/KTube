import React, {useState, useEffect, useContext} from 'react';
import {StyleSheet, View, TouchableOpacity, ViewStyle} from 'react-native';
import {useTheme} from '@ui-kitten/components';
import {UserDataContext, Types} from '../context/userdata-context';
import useStorage, {PlaylistItemType} from '../utils/usestorage';
import HeartOutline from '../assets/heart-outline.svg';
import HeartFill from '../assets/heart-fill.svg';

type Props = {
  item: PlaylistItemType;
  like: boolean;
  containerStyle?: ViewStyle;
  outlineFill?: string;
};
export default ({item, like, containerStyle, outlineFill}: Props) => {
  const [liked, setLiked] = useState(like);
  const {dispatch} = useContext(UserDataContext);
  useEffect(() => {
    setLiked(like);
  }, [like]);
  const usetheme = useTheme();
  const {saveToFavorites} = useStorage();
  const onPress = () => {
    setLiked(!liked);
    dispatch({type: Types.TOGGLE_VIDEO, video: item});
    saveToFavorites(item);
  };
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.heartContainer, containerStyle]}>
        {liked ? (
          <HeartFill style={styles.heartIcon} fill={'#e43f5a'} />
        ) : (
          <HeartOutline
            style={styles.heartIcon}
            fill={outlineFill || usetheme['background-alternative-color-1']}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  heartContainer: {backgroundColor: 'transparent', marginRight: 4},
  heartIcon: {width: 20, height: 20},
});
