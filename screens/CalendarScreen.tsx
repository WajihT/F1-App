import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
} from 'react-native';
import { useState, useEffect } from 'react';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from '../components/Icon';
import SeasonSelector from '../components/SeasonSelector';
import { F1DataService, Race } from '../services/f1DataService';
import { getCountryFlag } from '../utils/countryFlags';

const styles = StyleSheet.create({
  flagImage: {
    width: 32,
    height: 24,
    borderRadius: 4,
    marginRight: 12,
    resizeMode: 'cover',
  },
  flagContainer: {
    width: 32,
    height: 24,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: colors.grey + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagPlaceholder: {
    fontSize: 12,
    color: colors.grey,
  },
});

export default function CalendarScreen() {
  const [selectedSeason, setSelectedSeason] = useState(new Date().getFullYear());
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);

  const f1Service = F1DataService.getInstance();

  useEffect(() => {
    loadRaceCalendar();
  }, [selectedSeason]);

  const loadRaceCalendar = async () => {
    setLoading(true);
    console.log(`Loading race calendar for season ${selectedSeason}`);

    try {
      const raceData = await f1Service.fetchRaceCalendar(selectedSeason);
      setRaces(raceData);
      console.log(`Loaded ${raceData.length} races for ${selectedSeason}`);
    } catch (error) {
      console.error('Error loading race calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeasonChange = (season: number) => {
    console.log(`Season changed to: ${season}`);
    setSelectedSeason(season);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'upcoming':
        return colors.warning;
      case 'live':
        return colors.primary;
      default:
        return colors.grey;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'upcoming':
        return 'Upcoming';
      case 'live':
        return 'Live';
      default:
        return 'TBD';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const renderFlag = (country: string) => {
    const flagUrl = getCountryFlag(country);
    console.log(`Rendering flag for country: ${country}, URL: ${flagUrl}`);

    return (
      <Image
        source={{ uri: flagUrl }}
        style={styles.flagImage}
        onError={(error) => {
          console.log(`Failed to load flag for ${country}:`, error.nativeEvent.error);
        }}
        onLoad={() => {
          console.log(`Successfully loaded flag for ${country}`);
        }}
      />
    );
  };

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.headerTitle}>Race Calendar</Text>
      </View>

      <View style={commonStyles.content}>
        <SeasonSelector selectedSeason={selectedSeason} onSeasonChange={handleSeasonChange} />

        {loading ? (
          <View style={[commonStyles.centerContent, { flex: 1 }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[commonStyles.text, { marginTop: 16, textAlign: 'center' }]}>
              Loading {selectedSeason} race calendar...
            </Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {selectedRace ? (
              <View style={commonStyles.section}>
                <Text style={commonStyles.headerTitle}>{selectedRace.name}</Text>
                <Text style={[commonStyles.text, { marginBottom: 8 }]}>
                  📍 {selectedRace.location}, {selectedRace.country}
                </Text>
                <Text style={commonStyles.textSecondary}>
                  🗓️ {formatDate(selectedRace.date)}
                </Text>
                {selectedRace.winner && (
                  <Text style={[commonStyles.text, { marginTop: 12 }]}>
                    🏆 Winner: {selectedRace.winner}
                  </Text>
                )}

                <TouchableOpacity
  style={{
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  }}
  onPress={() => setSelectedRace(null)}
>
  <Text style={{ color: colors.background, fontSize: 16, fontWeight: '600' }}>
    ← Back to Calendar
  </Text>
</TouchableOpacity>
              </View>
            ) : (
              <View style={commonStyles.section}>
                <Text style={commonStyles.subtitle}>{selectedSeason} Season</Text>
                {races.length === 0 ? (
                  <View style={commonStyles.card}>
                    <Text style={[commonStyles.text, { textAlign: 'center' }]}>
                      No race calendar available for {selectedSeason}
                    </Text>
                  </View>
                ) : (
                  races.map((race) => (
                    <TouchableOpacity
                      key={`${race.id}-${race.name}`}
                      style={commonStyles.card}
                      onPress={() => setSelectedRace(race)}
                    >
                      <View style={commonStyles.row}>
                        <View style={{ flex: 1 }}>
                          <View
                            style={[
                              commonStyles.row,
                              { marginBottom: 8, alignItems: 'center' },
                            ]}
                          >
                            {renderFlag(race.country)}
                            <Text
                              style={[commonStyles.text, { fontWeight: '600', flex: 1 }]}
                            >
                              {race.name}
                            </Text>
                            <View
                              style={{
                                backgroundColor: getStatusColor(race.status),
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 12,
                              }}
                            >
                              <Text
                                style={[
                                  commonStyles.textSecondary,
                                  {
                                    fontSize: 10,
                                    color: colors.background,
                                    fontWeight: '600',
                                  },
                                ]}
                              >
                                {getStatusText(race.status)}
                              </Text>
                            </View>
                          </View>

                          <Text style={[commonStyles.textSecondary, { marginBottom: 4 }]}>
                            {race.country}
                          </Text>
                          <Text style={[commonStyles.textSecondary, { marginBottom: 4 }]}>
                            📍 {race.country}
                          </Text>
                          <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>
                            📅 {formatDate(race.date)}
                          </Text>

                          {race.winner && (
                            <View style={[commonStyles.row, { alignItems: 'center' }]}>
                              <Icon
                                name="trophy"
                                size={16}
                                style={{ color: colors.warning, marginRight: 8 }}
                              />
                              <Text
                                style={[
                                  commonStyles.text,
                                  { color: colors.warning, fontWeight: '600' },
                                ]}
                              >
                                Winner: {race.winner}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Icon name="chevron-forward" size={20} style={{ color: colors.grey }} />
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
