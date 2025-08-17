import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { commonStyles, colors } from '../styles/commonStyles';
import SeasonSelector from '../components/SeasonSelector';
import { F1DataService, Driver, Constructor } from '../services/f1DataService';
//import { Trophy, Medal, Users, User } from 'lucide-react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated } from 'react-native'; 
import TireIcon from "../assets/TireIcon"; 




export default function StandingsScreen() {
  const [activeTab, setActiveTab] = useState<'drivers' | 'constructors'>('drivers');
  const [selectedSeason, setSelectedSeason] = useState(new Date().getFullYear());
  const [driverStandings, setDriverStandings] = useState<Driver[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<Constructor[]>([]);
  const [loading, setLoading] = useState(false);

  const f1Service = F1DataService.getInstance();

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadStandings();
  }, [selectedSeason]);

  const loadStandings = async () => {
    setLoading(true);
    console.log(`Loading standings for season ${selectedSeason}`);
    
    try {
      const [drivers, constructors] = await Promise.all([
        f1Service.fetchDriverStandings(selectedSeason),
        f1Service.fetchConstructorStandings(selectedSeason)
      ]);
      
      setDriverStandings(drivers);
      setConstructorStandings(constructors);
      console.log(`Loaded ${drivers.length} drivers and ${constructors.length} constructors`);
    } catch (error) {
      console.error('Error loading standings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeasonChange = (season: number) => {
    console.log(`Season changed to: ${season}`);
    setSelectedSeason(season);
  };

  const getPositionColor = (position: number) => {
    if (position === 1) return colors.warning; // Gold
    if (position === 2) return colors.grey; // Silver
    if (position === 3) return '#CD7F32'; // Bronze
    return colors.text;
  };

function DriverCardPlaceholder({ position }: { position: number }) {
  // Gold, Silver, Bronze, Default
  const bg =
    position === 1
      ? '#1e1b13'
      : position === 2
      ? '#1c1d21'
      : position === 3
      ? '#1b1512'
      : '#18181b';
  const border =
    position === 1
      ? '#a58f43'
      : position === 2
      ? '#4b5563'
      : position === 3
      ? '#7c3f10'
      : 'transparent';

  return (
    <View
      style={[
        commonStyles.card,
        {
          backgroundColor: bg,
          borderRadius: 16,
          marginBottom: 12,
          opacity: 0.6,
          borderWidth: position <= 3 ? 1 : 0,
          borderColor: border,
        },
      ]}
    >
      <View style={[commonStyles.row, { alignItems: 'center' }]}>
        <View style={{ width: 40, height: 50, backgroundColor: '#232a3a', borderRadius: 4, marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <View style={{ width: '60%', height: 14, backgroundColor: '#232a3a', borderRadius: 4, marginBottom: 6 }} />
          <View style={{ width: '40%', height: 12, backgroundColor: '#232a3a', borderRadius: 4 }} />
        </View>
        <View style={{ width: 60, height: 14, backgroundColor: '#232a3a', borderRadius: 4, marginLeft: 12 }} />
      </View>
    </View>
  );
}

function ConstructorCardPlaceholder({ position }: { position: number }) {
  const bg =
    position === 1
      ? '#1e1b13'
      : position === 2
      ? '#1c1d21'
      : position === 3
      ? '#1b1512'
      : '#18181b';
  const border =
    position === 1
      ? '#a58f43'
      : position === 2
      ? '#4b5563'
      : position === 3
      ? '#7c3f10'
      : 'transparent';

  return (
    <View
      style={[
        commonStyles.card,
        {
          backgroundColor: bg,
          borderRadius: 16,
          marginBottom: 12,
          opacity: 0.6,
          borderWidth: position <= 3 ? 1 : 0,
          borderColor: border,
        },
      ]}
    >
      <View style={[commonStyles.row, { alignItems: 'center' }]}>
        <View style={{ width: 40, height: 50, backgroundColor: '#232a3a', borderRadius: 4, marginRight: 16 }} />
        <View style={{ flex: 1 }}>
          <View style={{ width: '60%', height: 14, backgroundColor: '#232a3a', borderRadius: 4, marginBottom: 6 }} />
        </View>
        <View style={{ width: 60, height: 14, backgroundColor: '#232a3a', borderRadius: 4, marginLeft: 12 }} />
      </View>
    </View>
  );
}

  const getRankStyles = (position: number) => {
  switch (position) {
    case 1:
      return {
        backgroundColor: '#1e1b13',
        borderColor: '#a58f43',
        textColor: '#facc15'
      };
    case 2:
      return {
        backgroundColor: '#1c1d21',
        borderColor: '#4b5563',
        textColor: '#ffffff'
      };
    case 3:
      return {
        backgroundColor: '#1b1512',
        borderColor: '#7c3f10',
        textColor: '#f97316'
      };
    default:
      return {
        backgroundColor: colors.card,
        borderColor: 'transparent',
        textColor: colors.text
      };
  }
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
        fontWeight: 'bold',
        fontSize: 24,
        color: '#fff',
        letterSpacing: -1,
      }}
    >
      Championship <Text style={{ color: '#ef4444' }}>Standings</Text>
    </Text>
  </TouchableOpacity>
</View>

      <View style={commonStyles.content}>
        <SeasonSelector
          selectedSeason={selectedSeason}
          onSeasonChange={handleSeasonChange}
        />

        {/* Tab Selector */}
        <View style={[commonStyles.row, { paddingVertical: 16 }]}>
<TouchableOpacity
  style={[
    commonStyles.card,
    {
      flex: 1,
      marginRight: 8,
      backgroundColor: activeTab === 'drivers' ? colors.primary : colors.card,
      borderColor: "#6f3139",
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 12,
    },
  ]}
  onPress={() => setActiveTab('drivers')}
>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <AntDesign name="user" size={24} color="white" />
    <Text
      style={[
        commonStyles.text,
        {
          fontWeight: '600',
          marginLeft: 8,
          fontFamily: 'JetBrainsMono-Regular',
          color: activeTab === 'drivers' ? colors.accent : colors.text,
        },
      ]}
    >
      Drivers
    </Text>
  </View>
</TouchableOpacity>

          <TouchableOpacity
  style={[
    commonStyles.card,
    {
      flex: 1,
      marginLeft: 8,
      backgroundColor: activeTab === 'constructors' ? colors.primary : colors.card,
      borderColor: "#6f3139",
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 12,
    },
  ]}
  onPress={() => setActiveTab('constructors')}
>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Feather name="users" size={24} color="white" />
    <Text
      style={[
        commonStyles.text,
        {
          fontWeight: '600',
          marginLeft: 8,
          fontFamily: 'JetBrainsMono-Regular',
          color: activeTab === 'constructors' ? colors.accent : colors.text,
        },
      ]}
    >
      Constructors
    </Text>
  </View>
</TouchableOpacity>
        </View>

{loading ? (
  <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
    {activeTab === 'drivers'
      ? [...Array(8)].map((_, idx) => <DriverCardPlaceholder key={idx} position={idx + 1} />)
      : [...Array(6)].map((_, idx) => <ConstructorCardPlaceholder key={idx} position={idx + 1} />)
    }
  </ScrollView>
) : (
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {activeTab === 'drivers' ? (
              <View style={commonStyles.section}>
                {driverStandings.length === 0 ? (
                  <View style={commonStyles.card}>
                    <Text style={[commonStyles.text, { textAlign: 'center' }]}>
                      No driver standings available for {selectedSeason}
                    </Text>
                  </View>
                ) : (
                  driverStandings.map((driver) => {
                  const { backgroundColor, borderColor, textColor } = getRankStyles(driver.position);

                  return (
                    <View
                      key={`${driver.position}-${driver.name}`}
                      style={[
                        commonStyles.card,
                        {
                          backgroundColor,
                          borderColor,
                          borderWidth: driver.position <= 3 ? 1 : 0,
                        }
                      ]}
                    >
                      <View style={commonStyles.row}>
                        <View style={[commonStyles.centerContent, { width: 40 }]}>
                          <Text style={{ fontFamily: 'JetBrainsMono-Regular', fontSize: 16, color: textColor }}>
                            {driver.position}
                          </Text>
                        </View>

                        <View style={{ flex: 1, marginLeft: 1 }}>
                          <Text style={{ fontFamily: 'JetBrainsMono-Regular', fontSize: 14, color: textColor }}>
                            {driver.name}
                          </Text>
                          <Text style={{ fontFamily: 'JetBrainsMono-Regular', fontSize: 12, color: textColor }}>
                            {driver.team}
                          </Text>
                        </View>

                        <View style={[commonStyles.centerContent, { flexDirection: 'row', gap: 8.5 }]}>
                          {/* Points */}
                          

                          {/* Wins */}
                          <View style={[commonStyles.centerContent, { flexDirection: 'row', gap: 20 }]}>
                          <View style={{ alignItems: 'center', marginRight: -10 }}>
                            <Text style={[commonStyles.text, { fontWeight: '600', fontSize: 16, color: textColor }]}>
                              {driver.wins}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                              <Ionicons name="trophy-outline" size={12} color="#d97706" />
                              <Text style={[commonStyles.textSecondary, { fontSize: 10, marginLeft: 4 }]}>
                                WINS
                              </Text>
                            </View>
                          </View>

                          {/* Podiums */}
                          <View style={{ alignItems: 'center' }}>
                            <Text style={[commonStyles.text, { fontWeight: '600', fontSize: 16, color: textColor }]}>
                              {driver.podiums}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                              <Ionicons name="medal-outline" size={12} color="#d97706" />
                              <Text style={[commonStyles.textSecondary, { fontSize: 10, marginLeft: 4 }]}>
                                PODIUMS
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View style={{ alignItems: 'center', marginRight: 1 }}>
                            <Text style={{ fontFamily: 'JetBrainsMono-Regular', fontSize: 16, color: textColor }}>
                              {driver.points}
                            </Text>
                            <Text style={[commonStyles.textSecondary, { fontSize: 10 }]}>PTS</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                }))
                }
              </View>
            ) : (
              <View style={commonStyles.section}>
                {constructorStandings.length === 0 ? (
                  <View style={commonStyles.card}>
                    <Text style={[commonStyles.text, { textAlign: 'center' }]}>
                      No constructor standings available for {selectedSeason}
                    </Text>
                  </View>
                ) : (
                  constructorStandings.map((constructor) => {
                  const { backgroundColor, borderColor, textColor } = getRankStyles(constructor.position);

                  return (
                    <View
                      key={`${constructor.position}-${constructor.name}`}
                      style={[
                        commonStyles.card,
                        {
                          backgroundColor,
                          borderColor,
                          borderWidth: constructor.position <= 3 ? 1 : 0,
                        }
                      ]}
                    >
                      <View style={commonStyles.row}>
                        <View style={[commonStyles.centerContent, { width: 40 }]}>
                          <Text style={[
                            commonStyles.title,
                            {
                              fontSize: 20,
                              color: textColor,
                            }
                          ]}>
                            {constructor.position}
                          </Text>
                        </View>

                        <View style={{ flex: 1, marginLeft: 16 }}>
                          <Text style={{ fontFamily: 'JetBrainsMono-Regular', fontSize: 14, color: textColor }}>
                            {constructor.name}
                          </Text>
                        </View>

                        <View style={commonStyles.centerContent}>
                          <Text style={{ fontFamily: 'JetBrainsMono-Regular', fontSize: 14, color: textColor }}>
                            {constructor.points} PTS
                          </Text>
                          <Text style={{ fontFamily: 'JetBrainsMono-Regular', fontSize: 14, color: textColor }}>
                            {constructor.wins} wins
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })
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