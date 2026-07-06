import { DarkTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { enableFreeze } from 'react-native-screens';
import { useEffect } from 'react';

import PLUROverlay from '@/components/PLUROverlay';
import AppTabs from '@/components/app-tabs';
import { FieldDataProvider } from '@/contexts/field-data-context';
import { ModeProvider } from '@/contexts/mode-context';

// Enable react-native-screens freeze — required for freezeOnBlur
// to actually work on inactive tabs. Without this, freezeOnBlur
// is silently ignored and all mounted screens re-render.
enableFreeze();

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  useEffect(() => {
    // Keep splash screen visible while all tabs preload
    const timer = setTimeout(() => SplashScreen.hideAsync(), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider value={DarkTheme}>
      <FieldDataProvider>
        <ModeProvider>
          <AppTabs />
          <PLUROverlay />
        </ModeProvider>
      </FieldDataProvider>
    </ThemeProvider>
  );
}
