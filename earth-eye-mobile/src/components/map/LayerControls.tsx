/**
 * LayerControls.tsx — Mission 16
 *
 * Compact vertical toggle stack for map layers.
 * Positioned top-left below the mode badge.
 * Design: whisper labels, sage active state, no drawer/sheet overhead.
 */
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Accents } from '@/constants/theme';

export type MapLayers = {
  trails:   boolean;
  hotspots: boolean;
  overlays: boolean;
};

type Props = {
  layers:   MapLayers;
  onChange: (layers: MapLayers) => void;
};

const LAYER_DEFS: { key: keyof MapLayers; label: string }[] = [
  { key: 'trails',   label: 'TRL' },
  { key: 'hotspots', label: 'SPP' },
  { key: 'overlays', label: 'SEN' },
];

export function LayerControls({ layers, onChange }: Props) {
  const toggle = (key: keyof MapLayers) => {
    onChange({ ...layers, [key]: !layers[key] });
  };

  return (
    <View style={s.container}>
      {LAYER_DEFS.map(({ key, label }) => (
        <Pressable
          key={key}
          onPress={() => toggle(key)}
          style={[s.btn, layers[key] && s.btnActive]}
        >
          <ThemedText style={[s.label, layers[key] && s.labelActive]}>
            {label}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 12,
    gap: 6,
  },
  btn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: 'rgba(15,15,13,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnActive: {
    backgroundColor: 'rgba(122,184,122,0.18)',
    borderColor: 'rgba(122,184,122,0.40)',
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: 'rgba(255,255,255,0.40)',
  },
  labelActive: {
    color: Accents.sage,
  },
});
