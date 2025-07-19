import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from '../components/Icon';
import SeasonSelector from '../components/SeasonSelector';
import { F1DataService, Driver, Constructor, Race } from '../services/f1DataService';
import { Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TireIcon from "../assets/TireIcon"; 
import { LinearGradient } from 'expo-linear-gradient';


export default function HomeScreen() {
  const [selectedSeason, setSelectedSeason] = useState(new Date().getFullYear());
  const [driverLeader, setDriverLeader] = useState<Driver | null>(null);
  const [constructorLeader, setConstructorLeader] = useState<Constructor | null>(null);
  const [nextRace, setNextRace] = useState<Race | null>(null);
  const [loading, setLoading] = useState(false);

  const f1Service = F1DataService.getInstance();
  const navigation = useNavigation();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadHomeData();
  }, [selectedSeason]);

    useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const loadHomeData = async () => {
    setLoading(true);
    console.log(`Loading home data for season ${selectedSeason}`);
    
    try {
      const [drivers, constructors, races] = await Promise.all([
        f1Service.fetchDriverStandings(selectedSeason),
        f1Service.fetchConstructorStandings(selectedSeason),
        f1Service.fetchRaceCalendar(selectedSeason),
      ]);
      
      // Get leaders
      setDriverLeader(drivers.length > 0 ? drivers[0] : null);
      setConstructorLeader(constructors.length > 0 ? constructors[0] : null);
      
      // Find next upcoming race
      const upcoming = races.find(race => race.status === 'upcoming');
      setNextRace(upcoming || null);
      
      console.log(`Loaded home data: ${drivers.length} drivers, ${constructors.length} constructors, ${races.length} races`);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeasonChange = (season: number) => {
    console.log(`Season changed to: ${season}`);
    setSelectedSeason(season);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getCountdown = (dateString: string) => {
    try {
      const raceDate = new Date(dateString);
      const now = new Date();
      const diffTime = raceDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'Past';
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return '1 day';
      return `${diffDays} days`;
    } catch {
      return 'TBD';
    }
  };

  const latestNews = [
    {
      id: 1,
      title: `${selectedSeason} F1 Season Overview`,
      summary: `Explore the complete ${selectedSeason} Formula 1 championship standings and race results`,
      time: '1 hour ago',
    },
    {
      id: 2,
      title: 'Championship Battle Heats Up',
      summary: 'Drivers and constructors fight for every point in the standings',
      time: '3 hours ago',
    },
    {
      id: 3,
      title: 'Historical F1 Data Available',
      summary: 'Browse through decades of Formula 1 history and statistics',
      time: '1 day ago',
    },
  ];

  return (
    <LinearGradient
      colors={['#090710', '#030610', '#0c060b', '#090710']}
      locations={[0, 0.15, 0.6, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
    <View style={commonStyles.container}>
      <View
  style={{
    alignItems: 'center',        // 🔴 Center horizontally
    justifyContent: 'center',    // 🔴 Center vertically (optional)
    marginBottom: 16,
  }}
>
  <TouchableOpacity
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
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
      <TireIcon width={28} height={28} fill="#ef4444" />
    </View>

    <Text
      style={{
        fontWeight: 'bold',
        fontSize: 24,
        color: '#fff',
        letterSpacing: -1,
      }}
    >
      F1 <Text style={{ color: '#ef4444' }}>Analytics</Text>
    </Text>
  </TouchableOpacity>
</View>


      <View style={commonStyles.content}>
        <SeasonSelector
          selectedSeason={selectedSeason}
          onSeasonChange={handleSeasonChange}
        />

        {loading ? (
          <View style={[commonStyles.centerContent, { flex: 1 }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[commonStyles.text, { marginTop: 16, textAlign: 'center' }]}>
              Loading {selectedSeason} season data...
            </Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {/* Next Race Card */}
            {nextRace && (
              <View style={commonStyles.section}>
                <Text style={commonStyles.subtitle}>Next Race</Text>
                <View style={[commonStyles.card, { backgroundColor: colors.primary }]}>
                  <View style={commonStyles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={[commonStyles.title, { color: colors.accent, fontSize: 20 }]}>
                        {nextRace.name}
                      </Text>
                      <Text style={[commonStyles.text, { color: colors.accent }]}>
                        {nextRace.location}
                      </Text>
                      <Text style={[commonStyles.textSecondary, { color: colors.accent, opacity: 0.8 }]}>
                        {formatDate(nextRace.date)}
                      </Text>
                    </View>
                    <View style={commonStyles.centerContent}>
                      <Text style={[commonStyles.title, { color: colors.accent, fontSize: 24 }]}>
                        {getCountdown(nextRace.date)}
                      </Text>
                      <Text style={[commonStyles.textSecondary, { color: colors.accent, opacity: 0.8 }]}>
                        remaining
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Quick Stats */}
            <View style={commonStyles.section}>
              <Text style={commonStyles.subtitle}>Championship Leaders</Text>
              <View style={commonStyles.row}>
                <View       style={[
        commonStyles.card,
        {
          flex: 1,
          marginRight: 8,
          backgroundColor: '#1e1b13',
          borderColor: '#a58f43',
          borderWidth: 1,
        },
      ]}>
                  <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
                    Driver
                  </Text>
                  <Text style={[commonStyles.title, { textAlign: 'center', fontSize: 18 }]}>
                    {driverLeader ? driverLeader.name : 'Loading...'}
                  </Text>
                  <Text style={[commonStyles.text, { textAlign: 'center', color: '#facc15' }]}>
                    {driverLeader ? `${driverLeader.points} pts` : '-'}
                  </Text>
                </View>
                <View style={[
        commonStyles.card,
        {
          flex: 1,
          marginLeft: 8,
          backgroundColor: '#1e1b13',
          borderColor: '#a58f43',
          borderWidth: 1,
        },
      ]}>
                  <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
                    Constructor
                  </Text>
                  <Text style={[commonStyles.title, { textAlign: 'center', fontSize: 18 }]}>
                    {constructorLeader ? constructorLeader.name : 'Loading...'}
                  </Text>
                  <Text style={[commonStyles.text, { textAlign: 'center', color: '#facc15' }]}>
                    {constructorLeader ? `${constructorLeader.points} pts` : '-'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Latest News */}
            <View style={commonStyles.section}>
              <Text style={commonStyles.subtitle}>Latest News</Text>
              {latestNews.map((news) => (
                <TouchableOpacity key={news.id} style={commonStyles.card}>
                  <View style={commonStyles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
                        {news.title}
                      </Text>
                      <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>
                        {news.summary}
                      </Text>
                      <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                        {news.time}
                      </Text>
                    </View>
                    <Icon name="chevron-forward" size={20} style={{ color: colors.grey }} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
    </LinearGradient>
  );
}