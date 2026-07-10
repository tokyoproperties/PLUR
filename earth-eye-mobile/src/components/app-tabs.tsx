import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

/**
 * AppTabs — the bottom navigation bar.
 *
 * 5 tabs: Home, Map, Atlas, Field, Suit
 *
 * Styled to match the EarthEye dark design language:
 * - bg #0F0F0D (page background)
 * - border rgba(255,255,255,0.07) (hairline)
 * - active icon rgba(255,255,255,0.90)
 * - inactive icon rgba(255,255,255,0.30)
 * - 9px uppercase whisper labels
 */

const INACTIVE = 'rgba(255,255,255,0.30)';
const ACTIVE = 'rgba(255,255,255,0.90)';

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: '#0F0F0D',
          borderTopColor: 'rgba(255,255,255,0.07)',
          borderTopWidth: 1,
          height: Platform.select({ ios: 84, android: 60 }),
          paddingBottom: Platform.select({ ios: 30, android: 8 }),
          paddingTop: Platform.select({ ios: 8, android: 6 }),
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 1.2,
          fontFamily: 'system-ui',
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        tabBarShowLabel: true,
        
        lazy: true,
        freezeOnBlur: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabGlyph name="home" color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <TabGlyph name="map" color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="atlas"
        options={{
          title: 'Atlas',
          tabBarIcon: ({ color }) => <TabGlyph name="atlas" color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="ecosystem"
        options={{
          title: 'Field',
          tabBarIcon: ({ color }) => <TabGlyph name="ecosystem" color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="suit"
        options={{
          title: 'Suit',
          tabBarIcon: ({ color }) => <TabGlyph name="suit" color={color as string} />,
        }}
      />
      {/* Hidden routes — accessible from Home quick-launch */}
      <Tabs.Screen name="sensors" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="explore" options={{ href: null, headerShown: false }} />
      {/* Species browser — folder route, all sub-screens hidden from tab bar */}
      <Tabs.Screen name="species/index" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="species/[id]" options={{ href: null, headerShown: false }} />
    </Tabs>
  );
}

/**
 * TabGlyph — SVG glyphs using react-native-svg.
 * Rounded, organic, naturalist sketchbook energy.
 * Stroke 1.8 active / 1.5 inactive.
 */
function TabGlyph({ name, color }: { name: string; color: string }) {
  const isActive = color === ACTIVE;
  const stroke = isActive ? 1.8 : 1.5;
  const size = 24;

  switch (name) {
    case 'home':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4 11.5 L12 5 L20 11.5 L20 19 Q20 20 19 20 L5 20 Q4 20 4 19 Z" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M10 20 L10 15 Q10 14.5 10.5 14.5 L13.5 14.5 Q14 14.5 14 15 L14 20" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'map':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M9 4 L4.5 6 L4.5 20 L9 18 L15 20 L19.5 18 L19.5 4 L15 6 Z" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M9 4 L9 18" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
          <Path d="M15 6 L15 20" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
        </Svg>
      );
    case 'atlas':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 6 Q8 4 4 5 L4 18 Q8 17 12 19 Q16 17 20 18 L20 5 Q16 4 12 6 Z" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M12 6 L12 19" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
        </Svg>
      );
    case 'ecosystem':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M5 19 Q5 10 12 5 Q19 10 19 19 Q12 17 5 19 Z" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M9 16 Q12 13 16 10" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'suit':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4 16 Q4 8 12 8 Q20 8 20 16" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M12 16 L16 11" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx={12} cy={16} r={1.5} fill={color} />
        </Svg>
      );
    default:
      return null;
  }
}
