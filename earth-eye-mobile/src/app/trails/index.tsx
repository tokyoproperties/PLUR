/**
 * Trail List Screen — /trails   (Mission 15)
 * 74-trail atlas. Client-side filter + sort. FlatList, 60fps.
 */
import { useCallback, useState } from 'react';
import {
  FlatList, Pressable, ScrollView, StyleSheet,
  TextInput, View, ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { TrailTile } from '@/components/TrailTile';
import { ThemedText } from '@/components/themed-text';
import { Accents, BottomTabInset, Spacing } from '@/constants/theme';
import { useTrailList, type TrailFilter } from '@/hooks/useTrailList';
import type { AtlasTrail } from '@/atlas/atlasApi';

const TILE_HEIGHT = 110;
const DIFF_CHIPS = ['easy', 'moderate', 'hard'] as const;
const DIFF_LABELS: Record<string, string> = { easy: 'Easy', moderate: 'Moderate', hard: 'Hard' };
const SORT_OPTS = [
  { key: 'alpha',      label: 'A–Z' },
  { key: 'distance',   label: 'Distance' },
  { key: 'elevation',  label: 'Elevation' },
  { key: 'difficulty', label: 'Difficulty' },
] as const;

export default function TrailListScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<TrailFilter>({ search: '', difficulty: null, sort: 'alpha' });
  const { trails, loading, error, totalCount } = useTrailList(filter);

  const handlePress = useCallback((id: string) => { router.push(`/trails/${id}`); }, [router]);
  const renderItem  = useCallback(({ item, index }: ListRenderItemInfo<AtlasTrail>) => (
    <TrailTile trail={item} index={index} onPress={handlePress} />
  ), [handlePress]);
  const keyExtractor = useCallback((t: AtlasTrail) => t.id, []);
  const getItemLayout = useCallback((_: unknown, i: number) => ({
    length: TILE_HEIGHT, offset: TILE_HEIGHT * i, index: i,
  }), []);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Search */}
      <View style={s.searchRow}>
        <TextInput
          style={s.searchInput}
          placeholder="Search trails…"
          placeholderTextColor="rgba(255,255,255,0.25)"
          value={filter.search}
          onChangeText={(t) => setFilter((f) => ({ ...f, search: t }))}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Sort chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
        {SORT_OPTS.map(({ key, label }) => (
          <Pressable key={key}
            onPress={() => setFilter((f) => ({ ...f, sort: key as TrailFilter['sort'] }))}
            style={[s.chip, filter.sort === key && s.chipActive]}>
            <ThemedText style={[s.chipLabel, filter.sort === key && s.chipLabelActive]}>
              {label}
            </ThemedText>
          </Pressable>
        ))}
        <View style={s.divider} />
        <Pressable
          onPress={() => setFilter((f) => ({ ...f, difficulty: null }))}
          style={[s.chip, filter.difficulty === null && s.chipActive]}>
          <ThemedText style={[s.chipLabel, filter.difficulty === null && s.chipLabelActive]}>All</ThemedText>
        </Pressable>
        {DIFF_CHIPS.map((d) => (
          <Pressable key={d}
            onPress={() => setFilter((f) => ({ ...f, difficulty: f.difficulty === d ? null : d }))}
            style={[s.chip, filter.difficulty === d && s.chipActive]}>
            <ThemedText style={[s.chipLabel, filter.difficulty === d && s.chipLabelActive]}>
              {DIFF_LABELS[d]}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {/* Count */}
      <ThemedText style={s.count}>
        {loading ? 'Loading trails…' : error ? 'Atlas unavailable' : `${trails.length} of ${totalCount} trails`}
      </ThemedText>

      {/* List */}
      <FlatList
        data={trails}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        windowSize={5}
        initialNumToRender={10}
        maxToRenderPerBatch={15}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: BottomTabInset + Spacing.four }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#0F0F0D' },
  searchRow:  { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  searchInput: {
    height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.07)',
    color: 'rgba(255,255,255,0.90)', paddingHorizontal: 14, fontSize: 15,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  chipRow: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.two, gap: 8, flexDirection: 'row' },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  chipActive:      { backgroundColor: 'rgba(122,184,122,0.15)', borderColor: 'rgba(122,184,122,0.35)' },
  chipLabel:       { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.45)' },
  chipLabelActive: { color: Accents.sage },
  divider:         { width: 1, backgroundColor: 'rgba(255,255,255,0.10)', marginHorizontal: 4 },
  count: {
    fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.9,
    color: 'rgba(255,255,255,0.25)', paddingHorizontal: Spacing.three, paddingBottom: Spacing.one,
  },
});
