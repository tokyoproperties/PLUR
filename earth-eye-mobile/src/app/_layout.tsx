import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import PLUROverlay from '@/components/PLUROverlay';
import { ModeProvider } from '@/contexts/mode-context';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ModeProvider>
        <AnimatedSplashOverlay />
        <AppTabs />
        {/* Global ambient overlay — sits above all screens, beneath interaction */}
        <PLUROverlay />
      </ModeProvider>
    </ThemeProvider>
  );
}
