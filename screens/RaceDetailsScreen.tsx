import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { F1DataService } from '../services/f1DataService';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from '../components/Icon';
import { LinearGradient } from 'expo-linear-gradient';


const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  highlightText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  resultRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default function RaceDetailScreen() {
  // ✅ Get route params via expo-router
  const { season, round, raceName } = useLocalSearchParams<{
    season: string;
    round: string;
    raceName: string;
  }>();

  // ✅ Convert to number for API call
  const parsedSeason = parseInt(season);
  const parsedRound = parseInt(round);

  const [raceResults, setRaceResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRaceResults();
  }, []);

  const fetchRaceResults = async () => {
    try {
      const data = await F1DataService.getInstance().fetchRaceResults(parsedSeason, parsedRound);
      setRaceResults(data);
    } catch (error) {
      console.error('Failed to fetch race results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWinner = () => raceResults[0]?.Driver?.familyName || 'Unknown';
  const getPole = () =>
    raceResults.find((r) => r.grid === '1')?.Driver?.familyName || 'Unknown';
  const getFastestLap = () =>
    raceResults.find((r) => r.FastestLap?.rank === '1')?.Driver?.familyName || 'Unknown';
  const getFastestLapTime = () =>
    raceResults.find((r) => r.FastestLap?.rank === '1')?.FastestLap?.Time?.time || 'N/A';

  return (
    <LinearGradient
  colors={['#090710', '#030610', '#0c060b', '#090710']}
  locations={[0, 0.15, 0.6, 1]}
  start={{ x: 0.5, y: 0 }}
  end={{ x: 0.5, y: 1 }}
  style={{ flex: 1 }}
>
    <ScrollView style={commonStyles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={commonStyles.headerTitle}>{raceName}</Text>

      {loading ? (
        <View style={commonStyles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[commonStyles.text, { marginTop: 12 }]}>Loading race results...</Text>
        </View>
      ) : (
        <>
          <View style={styles.sectionCard}>
            <Text style={styles.highlightText}>🏆 Race Winner</Text>
            <Text style={commonStyles.text}>{getWinner()}</Text>

            <Text style={[styles.highlightText, { marginTop: 12 }]}>⚡ Pole Position</Text>
            <Text style={commonStyles.text}>{getPole()}</Text>

            <Text style={[styles.highlightText, { marginTop: 12 }]}>⏱ Fastest Lap</Text>
            <Text style={commonStyles.text}>
              {getFastestLap()} – {getFastestLapTime()}
            </Text>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.highlightText}>📊 Session Results: Race</Text>

            {raceResults.map((result, index) => (
              <View key={index} style={styles.resultRow}>
                <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                  {index + 1}. {result.Driver.givenName} {result.Driver.familyName}
                </Text>
                <Text style={styles.label}>
                  Team: {result.Constructor.name} | Grid: {result.grid} | Status: {result.status} | Points: {result.points}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
    </LinearGradient>
  );
}
