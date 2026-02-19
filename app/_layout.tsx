import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Audio } from 'expo-av';

SplashScreen.preventAutoHideAsync();
Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'UthmanicHafs': require('../assets/fonts/UthmanicHafs_V20.ttf'),
  });

  useEffect(() => {
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    );
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </>
  );
}
