import { DarkTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import PLUROverlay from '@/components/PLUROverlay';
import AppTabs from '@/components/app-tabs';
import { FieldDataProvider } from '@/contexts/field-data-context';
import { ModeProvider } from '@/contexts/mode-context';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  useEffect(() => {
    const timer = setTimeout(() => SplashScreen.hideAsync(), 500);
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
