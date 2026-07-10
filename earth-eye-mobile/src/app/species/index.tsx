/**
 * Species List Screen  —  /species
 *
 * 542-item FlatList. Client-side search + group filter + sort.
 * All heavy work happens in useSpeciesList() — the component
 * only handles navigation and UI state.
 *
 * Performance contracts:
 * - FlatList with keyExtractor + getItemLayout for constant-time scroll
 * - windowSize=5 to keep memory low on 542 items
 * - initialNumToRender=12 for fast first paint
 * - No inline functions passed to renderItem (stable ref via useCallback)
 */

import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { SpeciesTile } from '@/components/SpeciesTile';
import { ThemedText } from '@/components/themed-text';
import { Accents, BottomTabInset, Spacing } from '@/constants/theme';
import {
  GROUP_LABELS,
  SPECIES_GROUPS,
  useSpeciesList,
  type SpeciesFilter,
} from '@/hooks/useSpeciesList';
import type { AtlasSpecies } from '@/atlas/atlasApi';

const TILE_HEIGHT = 96; // approximation for getItemLayout
const FILTER_GROUPS = ['bird', 'mammal', 'reptile', 'plant', 'insect', 'fungi', 'fish'] as const;

export default function SpeciesListScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<SpeciesFilter>({
    search: '',
    group:  null,
    sort:   'alpha',
  });

  const { species, loading, error, totalCount } = useSpeciesList(filter);

  const handlePress = useCallback((id: string) => {
    router.push(`/species/${id}`);
  }, [router]);

  const renderItem = useCallback(({ item, index }: ListRenderItemInfo<AtlasSpecies>) => (
    <SpeciesTile species={item} index={index} onPress={handlePress} />
  ), [handlePress]);

  const keyExtractor = useCallback((item: AtlasSpecies) => item.id, []);

  const getItemLayout = useCallback((_: unknown, index: number) => ({
    length: TILE_HEIGHT,
    offset: TILE_HEIGHT * index,
    index,
  }), []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search species…"
          placeholderTextColor="rgba(255,255,255,0.25)"
          value={filter.search}
          onChangeText={(text) => setFilter((f) => ({ ...f, search: text }))}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {/* Sort toggle */}
        <Pressable
          onPress={() =>
            setFilter((f) => ({ ...f, sort: f.sort === 'alpha' ? 'seasonal' : 'alpha' }))
          }
          style={styles.sortBtn}
        >
          <ThemedText style={styles.sortLabel}>
            {filter.sort === 'alpha' ? 'A–Z' : 'Season'}
          </ThemedText>
        </Pressable>
      </View>

      {/* Group filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <Pressable
          onPress={() => setFilter((f) => ({ ...f, group: null }))}
          style={[styles.chip, filter.group === null && styles.chipActive]}
        >
          <ThemedText style={[styles.chipLabel, filter.group === null && styles.chipLabelActive]}>
            All
          </ThemedText>
        </Pressable>
        {FILTER_GROUPS.map((g) => (
          <Pressable
            key={g}
            onPress={() => setFilter((f) => ({ ...f, group: f.group === g ? null : g }))}
            style={[styles.chip, filter.group === g && styles.chipActive]}
          >
            <ThemedText style={[styles.chipLabel, filter.group === g && styles.chipLabelActive]}>
              {GROUP_LABELS[g]}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {/* Count line */}
      <ThemedText style={styles.countLine}>
        {loading
          ? 'Loading atlas…'
          : error
          ? 'Atlas unavailable — cached data may apply'
          : `${species.length} of ${totalCount} species`}
      </ThemedText>

      {/* List */}
      <FlatList
        data={species}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        windowSize={5}
        initialNumToRender={14}
        maxToRenderPerBatch={20}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: BottomTabInset + Spacing.four }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0D',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.07)',
    color: 'rgba(255,255,255,0.90)',
    paddingHorizontal: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  sortBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.5,
  },
  filterRow: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  chipActive: {
    backgroundColor: 'rgba(122,184,122,0.15)',
    borderColor: 'rgba(122,184,122,0.35)',
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
  },
  chipLabelActive: {
    color: Accents.sage,
  },
  countLine: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    color: 'rgba(255,255,255,0.25)',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.one,
  },
});
