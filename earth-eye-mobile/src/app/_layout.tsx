import { DarkTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { enableFreeze } from 'react-native-screens';

import PLUROverlay from '@/components/PLUROverlay';
import AppTabs from '@/components/app-tabs';
import { FieldDataProvider } from '@/contexts/field-data-context';
import { ModeProvider } from '@/contexts/mode-context';

enableFreeze();
SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
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
