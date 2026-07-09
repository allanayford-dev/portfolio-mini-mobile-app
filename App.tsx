import { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { onAuthStateChanged, type User } from 'firebase/auth';

import { AuthScreen } from './app/AuthScreen';
import { auth } from './app/firebase';
import { HomeScreen } from './app/HomeScreen';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(!auth);

  useEffect(() => {
    if (!auth) {
      return undefined;
    }

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setIsAuthReady(true);
    });
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F2" />
      {!isAuthReady ? (
        <View style={styles.loadingScreen}>
          <ActivityIndicator color="#41644A" />
        </View>
      ) : user ? (
        <HomeScreen userEmail={user.email} />
      ) : (
        <AuthScreen />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F6F2',
  },
});
