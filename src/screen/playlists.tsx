import React, {useEffect, useCallback, useState} from 'react';
import {
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  StyleSheet,
  FlatList,
} from 'react-native';
import {
  Layout,
  Text,
  useTheme,
  TopNavigationAction,
  StyleService,
  useStyleSheet,
  Button,
} from '@ui-kitten/components';
import FastImage from 'react-native-fast-image';
import Carousel, {ParallaxImage} from 'react-native-snap-carousel';
import {StackNavigationProp} from '@react-navigation/stack';
import {useFocusEffect} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/navigation';
import CustomeTopNavigation from '../components/customtopnaviagtion';
import {getPlaylists, PlaylistsStorage} from '../utils/usestorage';
type PlaylistsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Playlists'
>;
import {BackIcon} from '../components/icons';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
export default ({navigation}: {navigation: PlaylistsScreenNavigationProp}) => {
  const styles = useStyleSheet(themedStyles);
  const [playlists, setPlaylists] = useState<PlaylistsStorage[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PlaylistsStorage | boolean>(
    false,
  );
  const goBack = () => {
    navigation.goBack();
  };
  const CustomBackAction = (): React.ReactElement => (
    <TopNavigationAction icon={BackIcon} onPress={goBack} />
  );
  useFocusEffect(
    useCallback(() => {
      onGetPlaylists();
    }, []),
  );
  const onGetPlaylists = async () => {
    try {
      const storagePlaylists = await getPlaylists();
      if (storagePlaylists) {
        setPlaylists(storagePlaylists);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const onPress = ({id, title, thumbnail, dateTime}: PlaylistsStorage) => {
    navigation.navigate('Videos', {
      playlistId: id,
      title,
      thumbnail,
      dateTime: dateTime || '',
    });
  };

  const onLongPress = (selectedItem: PlaylistsStorage) => {
    setSelectedItem(selectedItem);
    setModalVisible(!modalVisible);
  };
  const renderPlaylistCard = ({
    item,
    index,
  }: {
    item: PlaylistsStorage;
    index: number;
  }) => {
    return (
      <>
        <TouchableOpacity
          key={item.id}
          onPress={() => onPress(item)}
          onLongPress={() => onLongPress(item)}
          activeOpacity={0.8}>
          <Layout style={styles.item}>
            {/* <Layout style={styles.imageContainer}> */}
            <FastImage
              source={{uri: item.thumbnail}}
              // containerStyle={styles.imageContainer}
              resizeMode={'center'}
              style={styles.image}
            />
            {/* </Layout> */}

            <Layout style={styles.playlistDescContiner}>
              <Text
                category="s1"
                style={styles.playlistTitle}
                numberOfLines={1}>
                {item.title}
              </Text>
              <Text
                appearance="hint"
                category="s2"
                style={styles.playlistTitle}
                numberOfLines={1}>
                {`${item.playlistItems.length} videos`}
              </Text>
            </Layout>
          </Layout>
        </TouchableOpacity>
      </>
    );
  };
  return (
    <SafeAreaView style={styles.wrapper}>
      <CustomeTopNavigation
        customLeft={CustomBackAction}
        title="Home"
        alignment="start"
      />
      <Layout style={styles.playlistCardContainer}>
        <FlatList
          style={{flex: 1}}
          numColumns={2}
          data={playlists}
          renderItem={renderPlaylistCard}
          getItemLayout={(data: any, index: number) => ({
            length: 200,
            offset: 200 * index,
            index,
          })}
        />
      </Layout>
    </SafeAreaView>
  );
};

const themedStyles = StyleService.create({
  wrapper: {
    position: 'relative',
    flex: 1,
    backgroundColor: 'background-basic-color-1',
  },
  playlistCardContainer: {flex: 1, marginHorizontal: 18},
  item: {
    // alignItems: 'center',
    width: (screenWidth - 36) / 2,

    flex: 1,

    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  imageContainer: {
    flex: 1,
    // marginBottom: Platform.select({ios: 0, android: 1}),
    backgroundColor: 'white',
    borderRadius: 8,
  },
  image: {
    width: '100%',
    height: (screenWidth - 36) / 2 - 20,
    resizeMode: 'contain',
    borderRadius: 8,
  },
  playlistDescContiner: {
    marginTop: 5,
    alignItems: 'flex-start',
  },
  playlistTitle: {},
});
