import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { commonStyles, colors, typography } from '../styles/commonStyles';
import Icon from '../components/Icon';
import { newsStyle } from '../styles/newsStyle';
import SeasonSelector from '../components/SeasonSelector';
import { F1DataService, Driver, Constructor, Race } from '../services/f1DataService';
import { Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TireIcon from "../assets/TireIcon"; 
import { LinearGradient } from 'expo-linear-gradient';
import { Linking } from 'react-native';
import NewsService, { NewsItem } from '../lib/newsService';
import { AnimatedCard } from '../components/ui/AnimatedCard';
import { theme } from '../styles/theme';


export default function HomeScreen() {
  const [selectedSeason, setSelectedSeason] = useState(new Date().getFullYear());
  const [driverLeader, setDriverLeader] = useState<Driver | null>(null);
  const [constructorLeader, setConstructorLeader] = useState<Constructor | null>(null);
  const [nextRace, setNextRace] = useState<Race | null>(null);
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  const f1Service = F1DataService.getInstance();
  const navigation = useNavigation();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const newsService = NewsService.getInstance();

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

      loadNews();
      
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

    const loadNews = async () => {
    setNewsLoading(true);
    try {
      const latestNews = await newsService.fetchLatestNews();
      setNews(latestNews);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setNewsLoading(false);
    }
  };

  const handleNewsPress = async (newsItem: NewsItem) => {
    await newsService.openNewsArticle(newsItem.url);
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

function CardPlaceholder({ height = 80, style = {} }) {
  return (
    <View
      style={{
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        borderWidth: 1,
        opacity: 0.6,
        minHeight: height,
        justifyContent: 'center',
        ...style,
      }}
    >
      <View style={{ width: '50%', height: 16, backgroundColor: '#303030', borderRadius: 6, marginBottom: 6 }} />
      <View style={{ width: '30%', height: 12, backgroundColor: '#303030', borderRadius: 6 }} />
    </View>
  );
}

const latestNews = [
  {
    id: 1,
    title: 'Spa Set to Host Wet Belgian GP',
    summary: 'Weather forecasts predict rain for the Belgian Grand Prix weekend – could shake up the standings.',
    time: '2 hours ago',
    url: 'https://www.motorsport.com/f1/news/spa-2025-weather-forecast-rain/1056789/',
  },
  {
    id: 2,
    title: 'Oscar Piastri Leads Drivers’ Championship',
    summary: 'The McLaren driver continues to impress as he extends his lead ahead of Spa.',
    time: '4 hours ago',
    url: 'https://www.formula1.com/en/latest/article/oscar-piastri-leads-2025-standings.1A2BC3D4.html',
  },
  {
    id: 3,
    title: 'Audi Confirms 2026 Engine Partnership',
    summary: 'Audi officially announces engine development for their F1 debut in 2026.',
    time: '1 day ago',
    url: 'https://www.racefans.net/2025/07/21/audi-2026-f1-engine-confirmation/',
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
        fontSize: 23,
        color: '#fff',
        letterSpacing: -1,
        fontFamily: typography.fontFamily.bold,
      }}
    >
      F1 <Text style={{ color: '#ef4444', fontFamily: typography.fontFamily.semiBold }}>Analytics</Text>
    </Text>
  </TouchableOpacity>
</View>


      <View style={commonStyles.content}>
        <SeasonSelector
          selectedSeason={selectedSeason}
          onSeasonChange={handleSeasonChange}
        />

{loading ? (
  <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
    {/* Next Race Placeholder */}
    <View style={commonStyles.section}>
      <CardPlaceholder height={110} style={{ backgroundColor: '#7d272b', borderColor: '#cc3b3c' }} />
    </View>
    {/* Quick Stats Placeholders */}
    <View style={[commonStyles.section, { flexDirection: 'row' }]}>
      <CardPlaceholder height={90} style={{ flex: 1, marginRight: 8, backgroundColor: '#1c1c14', borderColor: '#b09114' }} />
      <CardPlaceholder height={90} style={{ flex: 1, marginLeft: 8, backgroundColor: '#1c1c14', borderColor: '#b09114' }} />
    </View>
    {/* Latest News Placeholders */}
    <View style={commonStyles.section}>
      <CardPlaceholder height={80} style={{ backgroundColor: '#1c1c1c', borderColor: '#303030' }} />
      <CardPlaceholder height={80} style={{ backgroundColor: '#1c1c1c', borderColor: '#303030' }} />
      <CardPlaceholder height={80} style={{ backgroundColor: '#1c1c1c', borderColor: '#303030' }} />
    </View>
  </ScrollView>
) : (
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} bounces={true} overScrollMode="always">
            {/* Next Race Card */}
            {nextRace && (
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
 Next Race
</Text>
                <View style={[commonStyles.card, { backgroundColor: '#7d2629', borderColor: '#ef4444', borderWidth: 1 }]}>
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
              <Text
  style={[
    commonStyles.subtitle,
    {
      textAlign: 'center',
      color: '#b09117ff', // gold accent
      fontWeight: '600',
      marginBottom: 12,
    },
  ]}
>
  Championship Leaders
</Text>
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
                  <Text style={[commonStyles.title, { textAlign: 'center', fontSize: 17 }]}>
                    {driverLeader ? driverLeader.name : 'Loading...'}
                  </Text>
                  <Text style={[commonStyles.text, { textAlign: 'center', color: '#f59e0b' }]}>
                    {driverLeader ? `${driverLeader.points} PTS` : '-'}
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
                  <Text style={[commonStyles.title, { textAlign: 'center', fontSize: 17 }]}>
                    {constructorLeader ? constructorLeader.name : 'Loading...'}
                  </Text>
                  <Text style={[commonStyles.text, { textAlign: 'center', color: '#f59e0b' }]}>
                    {constructorLeader ? `${constructorLeader.points} PTS` : '-'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Latest News */}
            <AnimatedCard delay={69} style={{ backgroundColor: "#00000eff" }}>
            <View style={newsStyle.newsSectionHeader}>
              <Text style={newsStyle.sectionTitle}>Latest News</Text>
              <TouchableOpacity style={newsStyle.viewAllButton}>
                <Text style={newsStyle.viewAllText}>View All</Text>
                <Icon name="chevron-forward" size={16} style={{ color: theme.colors.primary.main, marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
            {news.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[newsStyle.newsItem, index !== news.length - 1 && newsStyle.newsItemBorder]}
                activeOpacity={0.7}
                onPress={() => handleNewsPress(item)}
              >
                <View style={newsStyle.newsContent}>
                  <View style={newsStyle.newsHeader}>
                    <Text style={newsStyle.newsTitle}>{item.title}</Text>
                    <View style={newsStyle.newsMetadata}>
                      <Text style={newsStyle.newsTime}>{item.time}</Text>
                      <Text style={newsStyle.newsSource}> • {item.source}</Text>
                    </View>
                  </View>
                  <Text style={newsStyle.newsSummary}>{item.summary}</Text>
                </View>
                <View style={newsStyle.newsArrow}>
                  <Icon name="open-outline" size={18} style={{ color: theme.colors.text.tertiary }} />
                </View>
              </TouchableOpacity>
            ))}
          </AnimatedCard>
          </ScrollView>
        )}
      </View>
    </View>
    </LinearGradient>
  );
}