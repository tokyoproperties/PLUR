import 'expo-dev-client';
import { DarkTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { enableFreeze } from 'react-native-screens';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import PLUROverlay from '@/components/PLUROverlay';
import AppTabs from '@/components/app-tabs';
import { FieldDataProvider } from '@/contexts/field-data-context';
import { NarratorProvider } from '@/contexts/narrator-context';
import { ModeProvider } from '@/contexts/mode-context';

enableFreeze();
SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <ModeProvider>
        <FieldDataProvider>
          <NarratorProvider>
            <AppTabs />
            <PLUROverlay />
          </NarratorProvider>
        </FieldDataProvider>
      </ModeProvider>
      {/*
        AnimatedSplashOverlay is the ONLY thing that calls
        SplashScreen.hideAsync(). Its onLayout fires once this
        overlay mounts, which hides the native splash and then
        plays its own fade-out animation. Without rendering this,
        preventAutoHideAsync() above has no matching hideAsync()
        call and the app is stuck on the splash logo forever.
      */}
      <AnimatedSplashOverlay />
    </ThemeProvider>
  );
}
