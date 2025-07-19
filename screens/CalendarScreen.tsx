import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from '../components/Icon';
import SeasonSelector from '../components/SeasonSelector';
import { F1DataService, Race, RaceResults } from '../services/f1DataService';
import { getCountryFlag } from '../utils/countryFlags';
import { Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Octicons from '@expo/vector-icons/Octicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated } from 'react-native'; 


const styles = StyleSheet.create({
  // Updated to reflect more modern card look like on web
flagImage: {
  width: 40,
  height: 28,
  borderRadius: 6,
  resizeMode: 'cover',
},
  flagContainer: {
    width: 40,
    height: 28,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: colors.grey + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagPlaceholder: {
    fontSize: 12,
    color: colors.grey,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: colors.text,
  },
  cardSub: {
    fontSize: 12,
    color: colors.grey,
    marginTop: 2,
  },
});

export default function CalendarScreen() {
  const [selectedSeason, setSelectedSeason] = useState(new Date().getFullYear());
  const [races, setRaces] = useState<Race[]>([]);
  const [raceResults, setRaceResults] = useState<RaceResults[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);

  const f1Service = F1DataService.getInstance();

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadRaceCalendar();
  }, [selectedSeason]);

  const loadRaceCalendar = async () => {
    setLoading(true);
    try {
      const raceData = await f1Service.fetchRaceCalendar(selectedSeason);
      const resultsData = await f1Service.fetchRaceResults(selectedSeason);
      const racesWithWinner = raceData.map((race: Race) => {
        const result = resultsData.find((r: RaceResults) => r.round === race.round);
        const winner = result ? result.driver : undefined;
        const winnerTeam = result ? result.team : undefined;
        const winnerTeamColor = result ? result.teamColor : undefined;
        return { ...race, winner, winnerTeam, winnerTeamColor };
      });
      setRaces(racesWithWinner);
      setRaceResults(resultsData);
    } catch (error) {
      console.error('Error loading race calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeasonChange = (season: number) => {
    setSelectedSeason(season);
  };

  const getRaceStatus = (raceDate: string) => {
  const now = new Date();
  const raceDay = new Date(raceDate);

  const raceDateOnly = new Date(raceDay.toDateString());
  const todayDateOnly = new Date(now.toDateString());

  if (raceDateOnly.getTime() < todayDateOnly.getTime()) {
    return 'completed';
  } else if (raceDateOnly.getTime() === todayDateOnly.getTime()) {
    return 'live';
  } else {
    return 'upcoming';
  }
}

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

  function RaceCardPlaceholder() {
  return (
    <View
      style={{
        backgroundColor: '#141422',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#222',
        opacity: 0.6,
        height: 175,
      }}
    >
      {/* Flag + Title skeleton */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View style={{
          width: 40, height: 28, borderRadius: 6, backgroundColor: '#232a3a', marginRight: 12
        }} />
        <View>
          <View style={{ width: 120, height: 16, backgroundColor: '#232a3a', borderRadius: 4, marginBottom: 6 }} />
          <View style={{ width: 80, height: 12, backgroundColor: '#232a3a', borderRadius: 4 }} />
        </View>
      </View>
      {/* Date + Status skeleton */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ width: 60, height: 12, backgroundColor: '#232a3a', borderRadius: 4 }} />
        <View style={{ width: 50, height: 18, backgroundColor: '#232a3a', borderRadius: 999 }} />
      </View>
      {/* Winner skeleton */}
      <View style={{ width: 100, height: 12, backgroundColor: '#232a3a', borderRadius: 4 }} />
    </View>
  );
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    return `${month} ${day}`;
  } catch {
    return dateString;
  }
};
const totalRounds = races.length;
const getRoundPillColor = (round: number) => {
  if (round <= 5) return '#3e2963';       // Purple (Tailwind violet-500)
  if (round > totalRounds - 5) return '#533021'; // Brown (Tailwind amber-900)
  return '#213661';                       // Blue (default)
};
const getRoundPillTextColor = (round: number) => {
  if (round <= 5) return '#ddcaf4';       // Purple (Tailwind violet-500)
  if (round > totalRounds - 5) return '#deb893'; // Brown (Tailwind amber-900)
  return '#a5bee1';                       // Blue (default)
};

  const renderFlag = (country: string) => {
    const flagUrl = getCountryFlag(country);
    return (
      <Image
        source={{ uri: flagUrl }}
        style={styles.flagImage}
        onError={(error) => console.log(`Flag error for ${country}`, error.nativeEvent.error)}
      />
    );
  };

  return (
<LinearGradient
  colors={['#090710', '#030610', '#0c060b', '#090710']}
  locations={[0, 0.15, 0.6, 1]}
  start={{ x: 0.5, y: 0 }}
  end={{ x: 0.5, y: 1 }}
  style={{ flex: 1 }}
>
      <View style={commonStyles.container}>
  <TouchableOpacity
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      alignSelf: 'center',
    }}
  >
    <View style={{ position: 'relative', marginRight: 8 }}>
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 999,
          backgroundColor: 'rgba(239,68,68,0.2)',
          transform: [{ scale: pulseAnim }],
        }}
      />
    </View>

    <Text
      style={{
        fontWeight: 'bold',
        fontSize: 24,
        color: '#fff',
        letterSpacing: -1,
      }}
    >
      Race <Text style={{ color: '#ef4444' }}>Calendar</Text> <Text style={{ color: '#80a8d9' }}>& Results</Text>
    </Text>
  </TouchableOpacity>

      <View style={commonStyles.content}>
        <SeasonSelector selectedSeason={selectedSeason} onSeasonChange={handleSeasonChange} />

{loading ? (
  <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
    {[...Array(5)].map((_, idx) => (
      <RaceCardPlaceholder key={idx} />
    ))}
  </ScrollView>
) : (
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {selectedRace ? (
              <View style={commonStyles.section}>
                <Text style={commonStyles.headerTitle}>{selectedRace.name}</Text>
                <Text style={[commonStyles.text, { marginBottom: 8 }]}>
                  📍 {selectedRace.location}, {selectedRace.country}
                </Text>
                <Feather name="calendar" size={24} color="#4d5361" />
                <Text style={commonStyles.textSecondary}>
                  {formatDate(selectedRace.date)}
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
                  <Text
                    style={{
                      color: colors.background,
                      fontSize: 16,
                      fontWeight: '600',
                    }}
                  >
                    ← Back to Calendar
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={commonStyles.section}>
                <Text
  style={{
    fontSize: 14, // text-sm
    color: '#9ca3af', // text-gray-400
    fontWeight: '400',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Roboto_400Regular',
  }}
>
  {selectedSeason} Season Overview
</Text>
                {races.length === 0 ? (
                  <View style={commonStyles.card}>
                    <Text style={commonStyles.text}>
                      No race calendar available for {selectedSeason}
                    </Text>
                  </View>
                ) : (
                  races.map((race) => (
                  <Pressable
                    key={`${race.id}-${race.name}`}
                    onPress={() => setSelectedRace(race)}
                    style={({ pressed }) => ({
                      backgroundColor: '#101624',
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 16, // ⬅️ Extra spacing between cards
                      borderWidth: 1,
                      borderColor: pressed ? '#EF4444' : '#333', // 🔴 Red border on press
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    })}
                  >
                    {/* Top: Flag + Round */}
                    <View style={[commonStyles.row, { justifyContent: 'space-between', marginBottom: 12 }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {renderFlag(race.country)}
                        <View style={{ marginLeft: 8 }}>
                          <Text style={{ fontWeight: '700', fontSize: 15, color: colors.text }}>
                            {race.name}
                          </Text>
                          <Text style={styles.cardSub}>{race.location}</Text>
                        </View>
                      </View>
                      <View
                        style={{
                          backgroundColor: getRoundPillColor(race.round ?? 0),
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 999,
                        }}
                      >
                        <Text style={{ fontSize: 12, color: getRoundPillTextColor(race.round ?? 0), fontWeight: '600' }}>
                          Round {race.round ?? '?'}
                        </Text>
                      </View>
                    </View>

                    {/* Date + Status */}
                    <View style={[commonStyles.row, { justifyContent: 'space-between', marginBottom: 12 }]}>
                      <View style={commonStyles.row}>
                        <Feather name="calendar" size={17} color="#4d5361" marginRight={6} />
                        <Text style={[commonStyles.textSecondary]}>{formatDate(race.date)}</Text>
                      </View>
                      <View
                  style={{
                    backgroundColor:
                  getRaceStatus(race.date) === 'completed'
                    ? '#1D3B2A' // COMPLETED: dark green
                    : getRaceStatus(race.date) === 'live'
                    ? '#FF6B6B' // LIVE: light red
                    : '#192949', // UPCOMING: dark blue
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  {getRaceStatus(race.date) === 'completed' && (
                    <Feather name="flag" size={14} color="#4ADE80" style={{ marginRight: 4 }} />
                  )}
                  {getRaceStatus(race.date) === 'upcoming' && (
                    <MaterialIcons name="access-time" size={17} color="#80a8d9" style={{ marginRight: 4 }} />
                  )}
                  {getRaceStatus(race.date) === 'live' && (
                    <Octicons name="broadcast" size={17} color="#FF0000" style={{ marginRight: 4 }} />
                  )}
                  <Text
                    style={{
                      color:
                        getRaceStatus(race.date) === 'upcoming'
                          ? '#80a8d9'
                          : getRaceStatus(race.date) === 'live'
                          ? '#FF0000'
                          : '#4ADE80',
                      fontSize: 12,
                      fontWeight: '600',
                    }}
                  >
                    {getRaceStatus(race.date).toUpperCase()}
                  </Text>
                </View>
                    </View>

                    {/* Winner */}
                    {race.winner ? (
                  <View style={{ marginTop: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Ionicons name="medal-outline" size={17} color="#facc15" />
                      <Text
                        style={{
                          fontWeight: '600',
                          color: colors.text,
                          marginLeft: 8, // 🔁 Aligned with icon
                        }}
                      >
                        {race.winner}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Feather name="users" size={17} color="#4d5361" />
                      <Text
                        style={{
                          fontSize: 13,
                          color: 'white',
                          marginLeft: 8, // 🔁 Aligned with icon
                        }}
                      >
                        {race.winnerTeam ?? 'Unknown Team'}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={{ fontSize: 13, fontStyle: 'italic', color: colors.grey }}>
                    Results pending
                  </Text>
                )}
                  </Pressable>
                ))


                )}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
    </LinearGradient>
  );
}
