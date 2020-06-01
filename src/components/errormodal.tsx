import React, {useContext} from 'react';
import {SafeAreaView} from 'react-native';
import Modal from 'react-native-modal';
import {Layout, Text, useTheme} from '@ui-kitten/components';
import {hasNotch} from 'react-native-device-info';
import {AuthContext} from '../context/auth-context';

export default () => {
  const theme = useTheme();
  const {errMsg, errModal, dispatch} = useContext(AuthContext);
  const onErroShow = () => {
    const timeout = setTimeout(() => {
      dispatch({type: 'ERRORSEEN'});
      clearTimeout(timeout);
    }, 3000);
  };
  return (
    <Modal
      isVisible={errModal}
      animationIn={'slideInRight'}
      animationOut={'slideOutRight'}
      hasBackdrop={false}
      onModalShow={onErroShow}>
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: 'flex-end',
          height: 200,
        }}>
        <Layout
          style={{
            backgroundColor: theme['color-danger-default'],
            // margin: 10,
            marginTop: 80,
            width: 200,
            padding: 20,
            borderRadius: 10,
          }}>
          <Text category="h6" status="control">
            {errMsg}
          </Text>
        </Layout>
      </SafeAreaView>
    </Modal>
  );
};
