declare module '*.svg' {
  import {SvgProps} from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module 'react-native-dotenv' {
  /**
   * API key
   */
  export const IOS_CLIENT_ID: string;
}
