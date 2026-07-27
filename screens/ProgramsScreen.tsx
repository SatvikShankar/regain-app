// Programs — the user's saved programs. Reads storage on focus (storage is
// passive, so we re-read whenever the screen is shown). Tap a card to open it;
// long-press to delete (with a confirmation, since it's irreversible).

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../components/PrimaryButton';
import ProgramCard from '../components/ProgramCard';
import { bottomNavClearance, colors } from '../components/ScreenContainer';
import { RootStackParamList } from '../navigation/types';
import { StoredProgram } from '../types/program';
import { getProgramName } from '../utils/programHelpers';
import { deleteProgram, getAllPrograms } from '../utils/storage';

export default function ProgramsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [programs, setPrograms] = useState<StoredProgram[]>([]);

  const load = useCallback(async () => {
    setPrograms(await getAllPrograms());
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getAllPrograms().then((list) => {
        if (active) setPrograms(list);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  const confirmDelete = (program: StoredProgram) => {
    Alert.alert(
      'Delete program?',
      `"${getProgramName(program)}" will be permanently removed. This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteProgram(program.id);
            await load();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Programs</Text>

        {programs.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              You don't have any programs yet. Start one to get a plan tailored to you.
            </Text>
            <PrimaryButton
              label="Start a program"
              onPress={() => navigation.navigate('RegionSelect')}
            />
          </View>
        ) : (
          <>
            <Text style={styles.hint}>Tap to open · long-press to delete</Text>
            <View style={styles.list}>
              {programs.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  onPress={() => navigation.navigate('Program', { programId: program.id })}
                  onLongPress={() => confirmDelete(program)}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: bottomNavClearance,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 8,
  },
  list: {
    marginTop: 20,
    gap: 14,
  },
  empty: {
    marginTop: 28,
    gap: 20,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
});
