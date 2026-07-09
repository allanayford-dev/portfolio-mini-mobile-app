import { StatusBar } from 'react-native';

import { HomeScreen } from './app/HomeScreen';

export default function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F2" />
      <HomeScreen />
    </>
  );
}
