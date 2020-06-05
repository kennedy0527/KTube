/**
 * @format
 */
// import './wdyr';
import {AppRegistry} from 'react-native';
import {enableScreens} from 'react-native-screens';
import App from './App';
import {name as appName} from './app.json';
enableScreens();
require('react-native').unstable_enableLogBox();
AppRegistry.registerComponent(appName, () => App);
