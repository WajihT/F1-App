import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { commonStyles, colors } from '../styles/commonStyles';
import SeasonSelector from '../components/SeasonSelector';
import { F1DataService, Driver, Constructor } from '../services/f1DataService';

export default function StandingsScreen() {
  const [activeTab, setActiveTab] = useState<'drivers' | 'constructors'>('drivers');
  const [selectedSeason, setSelectedSeason] = useState(new Date().getFullYear());
  const [driverStandings, setDriverStandings] = useState<Driver[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<Constructor[]>([]);
  const [loading, setLoading] = useState(false);

  const f1Service = F1DataService.getInstance();

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

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.headerTitle}>Championship Standings</Text>
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
                backgroundColor: activeTab === 'drivers' ? colors.primary : colors.card 
              }
            ]}
            onPress={() => setActiveTab('drivers')}
          >
            <Text style={[
              commonStyles.text, 
              { 
                textAlign: 'center', 
                fontWeight: '600',
                color: activeTab === 'drivers' ? colors.accent : colors.text 
              }
            ]}>
              Drivers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              commonStyles.card,
              { 
                flex: 1, 
                marginLeft: 8, 
                backgroundColor: activeTab === 'constructors' ? colors.primary : colors.card 
              }
            ]}
            onPress={() => setActiveTab('constructors')}
          >
            <Text style={[
              commonStyles.text, 
              { 
                textAlign: 'center', 
                fontWeight: '600',
                color: activeTab === 'constructors' ? colors.accent : colors.text 
              }
            ]}>
              Constructors
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={[commonStyles.centerContent, { flex: 1 }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[commonStyles.text, { marginTop: 16, textAlign: 'center' }]}>
              Loading {selectedSeason} standings...
            </Text>
          </View>
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
                  driverStandings.map((driver) => (
                    <View key={`${driver.position}-${driver.name}`} style={commonStyles.card}>
                      <View style={commonStyles.row}>
                        <View style={[commonStyles.centerContent, { width: 40 }]}>
                          <Text style={[
                            commonStyles.title, 
                            { 
                              fontSize: 20, 
                              color: getPositionColor(driver.position) 
                            }
                          ]}>
                            {driver.position}
                          </Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                          <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                            {driver.name}
                          </Text>
                          <Text style={commonStyles.textSecondary}>
                            {driver.team}
                          </Text>
                        </View>
                        <View style={commonStyles.centerContent}>
                          <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                            {driver.points}
                          </Text>
                          <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                            {driver.wins} wins
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
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
                  constructorStandings.map((constructor) => (
                    <View key={`${constructor.position}-${constructor.name}`} style={commonStyles.card}>
                      <View style={commonStyles.row}>
                        <View style={[commonStyles.centerContent, { width: 40 }]}>
                          <Text style={[
                            commonStyles.title, 
                            { 
                              fontSize: 20, 
                              color: getPositionColor(constructor.position) 
                            }
                          ]}>
                            {constructor.position}
                          </Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                          <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                            {constructor.name}
                          </Text>
                        </View>
                        <View style={commonStyles.centerContent}>
                          <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                            {constructor.points}
                          </Text>
                          <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                            {constructor.wins} wins
                          </Text>
                        </View>
                      </View>
                    </View>
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