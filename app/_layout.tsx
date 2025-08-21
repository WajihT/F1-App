import { Stack, useGlobalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, SafeAreaView } from 'react-native';
import { commonStyles, typography } from '../styles/commonStyles';
import { useEffect, useState } from 'react';
import { setupErrorLogging } from '../utils/errorLogger';
import { useFonts } from 'expo-font';
import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_600SemiBold,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';

const STORAGE_KEY = 'emulated_device';

export default function RootLayout() {
  const actualInsets = useSafeAreaInsets();
  const { emulate } = useGlobalSearchParams<{ emulate?: string }>();
  const [storedEmulate, setStoredEmulate] = useState<string | null>(null);

const [fontsLoaded] = useFonts({
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_600SemiBold,
  Roboto_700Bold,
  'JetBrainsMono-Regular': require('../assets/fonts/JetBrainsMono-Regular.ttf'),
  'JetBrainsMono-Medium': require('../assets/fonts/JetBrainsMono-Medium.ttf'),
  'JetBrainsMono-SemiBold': require('../assets/fonts/JetBrainsMono-SemiBold.ttf'),
  'JetBrainsMono-Bold': require('../assets/fonts/JetBrainsMono-Bold.ttf'),
  'JetBrainsMono-ExtraBold': require('../assets/fonts/JetBrainsMono-ExtraBold.ttf'),
});

  useEffect(() => {
    // Set up global error logging
    setupErrorLogging();

    if (Platform.OS === 'web') {
      // If there's a new emulate parameter, store it
      if (emulate) {
        localStorage.setItem(STORAGE_KEY, emulate);
        setStoredEmulate(emulate);
      } else {
        // If no emulate parameter, try to get from localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setStoredEmulate(stored);
        }
      }
    }
  }, [emulate]);

  let insetsToUse = actualInsets;

  if (Platform.OS === 'web') {
    const simulatedInsets = {
      ios: { top: 47, bottom: 20, left: 0, right: 0 },
      android: { top: 40, bottom: 0, left: 0, right: 0 },
    };

    // Use stored emulate value if available, otherwise use the current emulate parameter
    const deviceToEmulate = storedEmulate || emulate;
    insetsToUse = deviceToEmulate ? simulatedInsets[deviceToEmulate as keyof typeof simulatedInsets] || actualInsets : actualInsets;
  }

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[commonStyles.wrapper, {
          paddingTop: insetsToUse.top,
          paddingBottom: insetsToUse.bottom,
          paddingLeft: insetsToUse.left,
          paddingRight: insetsToUse.right,
       }]}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'default',
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}