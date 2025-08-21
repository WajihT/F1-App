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
import { commonStyles, colors, typography } from '../styles/commonStyles';
import Icon from '../components/Icon';
import SeasonSelector from '../components/SeasonSelector';
import { F1DataService, Race, RaceResults } from '../services/f1DataService';
import { getCountryFlag } from '../utils/countryFlags';
//import { Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Octicons from '@expo/vector-icons/Octicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated } from 'react-native'; 
import React from 'react';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { fetchRace, fetchRaceResults } from '@/lib/api';
import TireIcon from "../assets/TireIcon";
import { Pressable, type PressableStateCallbackType } from 'react-native';
import PositionsTabContentMobile from '../components/PositionsTabContentMobileProps';
import TireStrategy from '../components/TireStrategy';
import LapTimesChart from '../components/LapTimesChart';
import TelemetryDashboard from '../components/TelemetryDashboard';
import CircuitComparisonChart from '../components/CircuitComparisonChart';
import ThrottleChart from '../components/ThrottleChart';
import BrakeChart from '../components/BrakeChart';
import RPMChart from '../components/RPMChart';
import DRSChart from '../components/DRSChart';
import SpeedTraceChart from '../components/SpeedTraceChart';
import TrackDominanceChart from '../components/TrackDominanceChart';


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
    fontFamily: typography.fontFamily.bold,
  },
  cardSub: {
    fontSize: 12,
    color: colors.grey,
    marginTop: 2,
    fontFamily: typography.fontFamily.regular,
  },
});

const raceTabs = [
  { key: 'results', label: 'Results', icon: <Feather name="users" size={18} /> },
  { key: 'positions', label: 'Positions', icon: <Feather name="map-pin" size={18} /> },
  { key: 'strategy', label: 'Strategy', icon: <Feather name="flag" size={18} /> },
  { key: 'laptimes', label: 'Lap Times', icon: <Feather name="clock" size={18} /> },
  { key: 'circuit', label: 'Track Dominance', icon: <Feather name="map" size={18} /> },
  { key: 'telemetry', label: 'Telemetry', icon: <Feather name="bar-chart-2" size={18} /> },
];

export default function CalendarScreen() {
  const [selectedSeason, setSelectedSeason] = useState(new Date().getFullYear());
  const [races, setRaces] = useState<Race[]>([]);
  const [raceResults, setRaceResults] = useState<RaceResults[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [activeRaceTab, setActiveRaceTab] = useState('results');
  const [activeSession, setActiveSession] = useState('R');

  const f1Service = F1DataService.getInstance();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadRaceCalendar();
  }, [selectedSeason]);

const loadRaceCalendar = async () => {
  setLoading(true);
  try {
    // Get schedule (raceData) and results (seasonResults)
    const raceData = await f1Service.fetchRaceCalendar(selectedSeason);
    const seasonResults = await f1Service.fetchSeasonRaces(selectedSeason);

    //console.log(seasonResults);

    // Merge winner and winnerTeam into raceData
    const mergedRaces = raceData.map(race => {
      const result = seasonResults.find(
        res => res.name === race.name || res.round === race.round
      );
      return {
        ...race,
        winner: result?.winner,
        winnerTeam: result?.winnerTeam,
      };
    });

    setRaces(mergedRaces);
  } catch (error) {
    console.error('Error loading race calendar:', error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  const fetchSelectedRaceResults = async () => {
    if (!selectedRace) return;
    setLoading(true);
    try {
      const eventSlug = selectedRace.name.toLowerCase().replace(/ /g, '_');
      const data = await f1Service.fetchRaceResults(selectedSeason, eventSlug, activeSession);
      setRaceResults(data);
    } catch (error) {
      console.error('Error fetching detailed race results:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchSelectedRaceResults();
}, [selectedRace, activeSession, selectedSeason]);

  const handleSeasonChange = (season: number) => {
    setSelectedSeason(season);
  };

  const handleSessionChange = (session: string) => {
    setActiveSession(session);
  };

function InfoCardPlaceholder({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View
      style={{
        backgroundColor: '#18181b',
        borderRadius: 16,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
        borderWidth: 1,
        borderColor: '#232a3a',
        opacity: 0.7,
      }}
    >
      <View>
        <Text style={{ color: '#9ca3af', fontSize: 13, fontWeight: '500', marginBottom: 6, fontFamily: typography.fontFamily.regular }}>
          {label}
        </Text>
        <View style={{ width: 80, height: 18, backgroundColor: '#232a3a', borderRadius: 8, marginBottom: 4 }} />
        <View style={{ width: 50, height: 14, backgroundColor: '#232a3a', borderRadius: 8 }} />
      </View>
      <View style={{ opacity: 0.5 }}>
        {icon}
      </View>
    </View>
  );
}

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

  const getWinnerDriver = () => {
    return raceResults.length > 0 ? raceResults[0]?.fullName ?? 'TBD' : 'TBD';
  };

  const getWinnerTeam = () => {
    return raceResults.length > 0 ? raceResults[0]?.team ?? null : null;
  };

  const getPoleDriver = () => {
    return raceResults.length > 0 ? raceResults[0]?.fullName ?? 'TBD' : 'TBD';
  };

  const getPoleTime = () => {
    return raceResults.length > 0 ? raceResults[0]?.poleLapTimeValue ?? null : null;
  };

  const getFastestDriver = () => {
    return raceResults.find((r) => r.isFastestLap)?.fullName ?? 'TBD';
  };

  const getFastestTime = () => {
    return raceResults.find((r) => r.isFastestLap)?.fastestLapTimeValue ?? null;
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
{selectedRace && (
  <Pressable
    onPress={() => setSelectedRace(null)}
    style={({ pressed }) => ({
      position: 'absolute',
      top: 80,
      left: 16,
      zIndex: 10,
      backgroundColor: pressed ? '#202937' : 'rgba(0,0,0,0)',
      borderRadius: 10,
      padding: 10,
      elevation: 0,
      shadowColor: 'transparent',
    })}
  >
    <Feather name="arrow-left" size={24} color="#fff" />
  </Pressable>
)}

      <View
  style={{
    alignItems: 'center',        // 🔴 Center horizontally
    justifyContent: 'center',    // 🔴 Center vertically (optional)
    marginBottom: 16,
    marginTop: 5,
  }}
>
  <TouchableOpacity
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    }}
  >
    <View style={{ position: 'relative', marginRight: 5 }}>
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
      <TireIcon width={28} height={28} fill="#ef4444" />
    </View>

    <Text
      style={{
        fontWeight: '500',
        fontSize: 22,
        color: '#fff',
        letterSpacing: -1,
        fontFamily: typography.fontFamily.bold,
      }}
    >
      Schedule <Text style={{ color: '#ef4444', fontFamily: typography.fontFamily.semiBold }}>& Results</Text>
    </Text>
  </TouchableOpacity>
</View>

      <View style={commonStyles.content}>
        <SeasonSelector selectedSeason={selectedSeason} onSeasonChange={handleSeasonChange} />

{!selectedRace && loading ? (
  // Calendar loading state
  <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
    {[...Array(5)].map((_, idx) => (
      <RaceCardPlaceholder key={idx} />
    ))}
  </ScrollView>
) : (
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
{selectedRace ? (
  <View style={commonStyles.section}>
    {/* Title & Season */}
    <Text style={[commonStyles.headerTitle, { fontSize: 28, fontWeight: 'bold', marginBottom: 2 }]}>
      {selectedRace.name}
    </Text>
<Text
  style={{
    color: '#9ca3af',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  }}
>
  {selectedSeason} Season
</Text>

    {/* Info Cards */}
    <View style={{ gap: 12, marginBottom: 18 }}>
      {loading ? (
        <>
          <InfoCardPlaceholder icon={<Ionicons name="trophy-outline" size={22} color="#f87171" />} label="Race Winner" />
          <InfoCardPlaceholder icon={<Feather name="zap" size={22} color="#80a8d9" />} label="Pole Position" />
          <InfoCardPlaceholder icon={<Feather name="clock" size={22} color="#80a8d9" />} label="Fastest Lap" />
        </>
      ) : (
        <>
          {/* Winner */}
          <View style={{
            backgroundColor: '#18181b',
            borderRadius: 16,
            padding: 18,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 4,
            borderWidth: 1,
            borderColor: '#232a3a',
          }}>
            <View>
              <Text style={{ color: '#9ca3af', fontSize: 13, fontWeight: '500', marginBottom: 2, fontFamily: typography.fontFamily.regular }}>
                Race Winner
              </Text>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '500', fontFamily: typography.fontFamily.bold }}>
                {getWinnerDriver()}
              </Text>
              {getWinnerTeam() && (
                <Text style={{ color: '#9ca3af', fontSize: 14, fontFamily: typography.fontFamily.regular }}>
                  {getWinnerTeam()}
                </Text>
              )}
            </View>
            <Ionicons name="trophy-outline" size={22} color="#f87171" />
          </View>
          {/* Pole Position */}
          <View style={{
            backgroundColor: '#18181b',
            borderRadius: 16,
            padding: 18,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 4,
            borderWidth: 1,
            borderColor: '#232a3a',
          }}>
            <View>
              <Text style={{ color: '#9ca3af', fontSize: 13, fontWeight: '500', marginBottom: 2, fontFamily: typography.fontFamily.regular }}>
                Pole Position
              </Text>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '500', fontFamily: typography.fontFamily.bold }}>
                {getPoleDriver() ?? getPoleTime() ?? 'TBD'}
              </Text>
              {getPoleTime() && (
                <Text style={{ color: '#9ca3af', fontSize: 14, fontFamily: typography.fontFamily.regular }}>
                  {getPoleTime()}
                </Text>
              )}
            </View>
            <Feather name="zap" size={22} color="#80a8d9" />
          </View>
          {/* Fastest Lap */}
          <View style={{
            backgroundColor: '#18181b',
            borderRadius: 16,
            padding: 18,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 4,
            borderWidth: 1,
            borderColor: '#232a3a',
          }}>
            <View>
              <Text style={{ color: '#9ca3af', fontSize: 13, fontWeight: '500', marginBottom: 2, fontFamily: typography.fontFamily.regular }}>
                Fastest Lap
              </Text>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '500', fontFamily: typography.fontFamily.bold }}>
                {getFastestDriver() ?? getFastestTime() ?? 'TBD'}
              </Text>
              {getFastestTime() && (
                <Text style={{ color: '#9ca3af', fontSize: 14, fontFamily: typography.fontFamily.regular }}>
                  {getFastestTime()}
                </Text>
              )}
            </View>
            <Feather name="clock" size={22} color="#80a8d9" />
          </View>
        </>
      )}
    </View>

    {/* Segmented Tab Bar */}
<View
  style={{
    backgroundColor: '#101624',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#384151',
    padding: 4,
    marginVertical: 8,
    marginHorizontal: 0,
    marginBottom: 18,
  }}
>
  {[0, 2, 4].map((startIdx) => (
    <View
      key={startIdx}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: startIdx < 4 ? 2 : 0,
      }}
    >
      {raceTabs.slice(startIdx, startIdx + 2).map((tab, tabIdxInRow) => (
  <Pressable
    key={tab.key}
    onPress={() => setActiveRaceTab(tab.key)}
    style={({ pressed }: PressableStateCallbackType) => ({
      backgroundColor:
        activeRaceTab === tab.key
          ? colors.primary
          : pressed
          ? '#27303f'
          : '#141422',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flex: 1,
      margin: 1,
      marginLeft: tabIdxInRow === 0 ? 1 : 0,   // ⬅️ Left tab
      
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    })}
  >
    {React.cloneElement(tab.icon, {
      color: '#fff',
      style: { marginRight: 10 },
    })}
    <Text
      style={{
        color: '#fff',
        fontWeight: '500',
        fontSize: 14.5,
        fontFamily: typography.fontFamily.bold,
      }}
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {tab.label}
    </Text>
  </Pressable>
))}
    </View>
  ))}
</View>



{/* Tab Content */}
<View style={{ marginBottom: 18 }}>
  {activeRaceTab === 'results' && (
    <View style={{ paddingBottom: 16 }}>
      {/* Header Row */}
      <View
        style={{
          flexDirection: 'row',
          paddingVertical: 10,
          paddingHorizontal: 12,
          backgroundColor: '#18181b',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          borderBottomWidth: 1,
          borderColor: '#232a3a',
        }}
      >
        {['Pos', 'Driver', 'Grid', 'Status', 'Pts'].map((label, idx) => (
          <Text
            key={idx}
            style={{
              flex: idx === 1 ? 2 : idx === 3 ? 1.5 : 1,
              color: '#9ca3af',
              fontSize: 13,
              fontWeight: '500',
              fontFamily: typography.fontFamily.bold,
              textAlign: 'center', // ✅ Centered header text
            }}
          >
            {label}
          </Text>
        ))}
      </View>

      {/* Results Rows */}
      {raceResults.map((result, index) => (
        <View
          key={index}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 10,
            paddingHorizontal: 12,
            backgroundColor: index % 2 === 0 ? '#111827' : '#101624',
            borderBottomWidth: 1,
            borderColor: '#232a3a',
          }}
        >
          {/* Position */}
          <Text style={{ flex: 1, color: '#fff', fontSize: 14, textAlign: 'center', fontFamily: typography.fontFamily.regular }}>
            {index + 1}
          </Text>

          {/* Driver */}
          <Text style={{ flex: 2, color: '#fff', fontSize: 14, textAlign: 'center', fontFamily: typography.fontFamily.regular }}>
            {result.fullName ?? 'Unknown'}
          </Text>

          {/* Grid */}
          <Text style={{ flex: 1, color: '#fff', fontSize: 14, textAlign: 'center', fontFamily: typography.fontFamily.regular }}>
            {result.gridPosition ?? '-'}
          </Text>

          {/* Status */}
          <Text
            style={{
              flex: 1.5,
              color: result.status?.toLowerCase().includes('dnf') ? '#f87171' : '#9ca3af',
              fontSize: 14,
              textAlign: 'center',
              fontFamily: typography.fontFamily.regular,
            }}
          >
            {result.resultStatus ?? 'N/A'}
          </Text>

          {/* Points */}
          <Text style={{ flex: 1, color: '#fff', fontSize: 14, textAlign: 'center', fontFamily: typography.fontFamily.regular }}>
            {result.points != null ? Math.round(result.points) : '0'}
          </Text>
        </View>
      ))}
    </View>
  )}

{activeRaceTab === 'positions' && selectedRace && (
  <PositionsTabContentMobile
    year={selectedSeason}
    event={selectedRace.name.toLowerCase().replace(/ /g, '_')}
    session={activeSession}
  />
)}

  {activeRaceTab === 'strategy' && selectedRace && (
    <TireStrategy
      year={selectedSeason}
      event={selectedRace.name.toLowerCase().replace(/ /g, '_')}
      session={activeSession}
    />
  )}
  {activeRaceTab === 'laptimes' && selectedRace && (
    <LapTimesChart
      year={selectedSeason}
      event={selectedRace.name.toLowerCase().replace(/ /g, '_')}
      session={activeSession}
    />
  )}
  {activeRaceTab === 'circuit' && selectedRace && (
    <View style={{ paddingBottom: 20, paddingHorizontal: 16 }}>
      {/* Track Dominance Charts */}
      <View style={{ gap: 24 }}>
        {/* Speed Trace Chart */}
        <View>
          <CircuitComparisonChart
            year={selectedSeason}
            event={selectedRace.name.toLowerCase().replace(/ /g, '_')}
            session={activeSession}
          />
        </View>

        {/* Track Dominance Comparison Chart */}
        <View>
          <TrackDominanceChart
            year={selectedSeason}
            event={selectedRace.name.toLowerCase().replace(/ /g, '_')}
            session={activeSession}
          />
        </View>
      </View>
    </View>
  )}
  {activeRaceTab === 'telemetry' && selectedRace && (
    <View style={{ paddingBottom: 20, paddingHorizontal: 16 }}>
      {/* Vertical stack layout for the 4 telemetry charts */}
      <View style={{ gap: 24 }}>
        {/* Throttle Chart */}
        <View>
          <ThrottleChart
            year={selectedSeason}
            event={selectedRace.name.toLowerCase().replace(/ /g, '_')}
            session={activeSession}
          />
        </View>

        {/* Brake Chart */}
        <View>
          <BrakeChart
            year={selectedSeason}
            event={selectedRace.name.toLowerCase().replace(/ /g, '_')}
            session={activeSession}
          />
        </View>

        {/* RPM Chart */}
        <View>
          <RPMChart
            year={selectedSeason}
            event={selectedRace.name.toLowerCase().replace(/ /g, '_')}
            session={activeSession}
          />
        </View>

        {/* DRS Chart */}
        <View>
          <DRSChart
            year={selectedSeason}
            event={selectedRace.name.toLowerCase().replace(/ /g, '_')}
            session={activeSession}
          />
        </View>
      </View>
    </View>
  )}
</View>


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
    fontFamily: typography.fontFamily.regular,
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
                    onPress={() => { setRaceResults([]); setLoading(true); setSelectedRace(race); }}
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
                    {/* Round badge positioned absolutely */}
                    <View
                      style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        backgroundColor: getRoundPillColor(race.round ?? 0),
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 999,
                        zIndex: 1,
                      }}
                    >
                      <Text style={{ fontSize: 12, color: getRoundPillTextColor(race.round ?? 0), fontWeight: '600', fontFamily: typography.fontFamily.semiBold }}>
                        Round {race.round ?? '?'}
                      </Text>
                    </View>

                    {/* Top: Flag + Title (with space for round badge) */}
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, marginRight: 80 }}>
                      <View style={{ marginTop: 4 }}>
                        {renderFlag(race.country)}
                      </View>
                      <View style={{ marginLeft: 8, flex: 1 }}>
                        <Text 
                          style={{ 
                            fontWeight: 'normal', 
                            fontSize: 15, 
                            color: colors.text, 
                            fontFamily: typography.fontFamily.bold,
                            flexWrap: 'wrap',
                            flexShrink: 1
                          }}
                          numberOfLines={2}
                        >
                          {race.name}
                        </Text>
                        <Text style={styles.cardSub}>{race.location}</Text>
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
                      fontFamily: typography.fontFamily.semiBold,
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
                          fontFamily: typography.fontFamily.semiBold,
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
                          fontFamily: typography.fontFamily.regular,
                        }}
                      >
                        {race.winnerTeam}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={{ fontSize: 13, fontStyle: 'italic', color: colors.grey, fontFamily: typography.fontFamily.regular }}>
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
