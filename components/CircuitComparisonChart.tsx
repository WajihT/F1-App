import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { Svg, Path, G } from 'react-native-svg';
import { commonStyles } from '../styles/commonStyles';
import { fetchSessionDrivers, fetchSectorComparison } from '../lib/api';
import { SessionDriver } from '../lib/types';

interface TrackSection {
  id: string;
  name: string;
  type: string;
  path: string;
  driver1Advantage: number;
}

interface SectorComparisonData {
  driver1Code: string;
  driver2Code: string;
  circuitLayout: string;
  sections: TrackSection[];
}

interface CircuitComparisonChartProps {
  year: number;
  event: string;
  session: string;
}

const CircuitComparisonChart: React.FC<CircuitComparisonChartProps> = ({
  year,
  event,
  session,
}) => {
  const [drivers, setDrivers] = useState<SessionDriver[]>([]);
  const [selectedDriver1, setSelectedDriver1] = useState<string>('');
  const [selectedDriver2, setSelectedDriver2] = useState<string>('');
  const [comparisonData, setComparisonData] = useState<SectorComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [shouldLoadChart, setShouldLoadChart] = useState(false);

  // Fetch available drivers
  useEffect(() => {
    const loadDrivers = async () => {
      try {
        const sessionDrivers = await fetchSessionDrivers(year, event, session);
        setDrivers(sessionDrivers);
        
        // Auto-select first two drivers if available
        if (sessionDrivers.length >= 2) {
          setSelectedDriver1(sessionDrivers[0].code);
          setSelectedDriver2(sessionDrivers[1].code);
        }
      } catch (error) {
        console.error('Failed to fetch drivers:', error);
      }
    };

    if (year && event && session) {
      loadDrivers();
    }
  }, [year, event, session]);

  const loadComparisonData = async () => {
    if (!selectedDriver1 || !selectedDriver2 || selectedDriver1 === selectedDriver2) {
      Alert.alert('Error', 'Please select two different drivers');
      return;
    }

    setLoading(true);
    setShouldLoadChart(true);
    
    try {
      const data = await fetchSectorComparison(
        year,
        event,
        session,
        selectedDriver1,
        selectedDriver2,
        'fastest',
        'fastest'
      );
      setComparisonData(data);
    } catch (error) {
      console.error('Failed to fetch comparison data:', error);
      Alert.alert('Error', 'Failed to load comparison data');
    } finally {
      setLoading(false);
    }
  };

  const renderDriverSelector = (
    selectedValue: string,
    onValueChange: (value: string) => void,
    placeholder: string
  ) => {
    const selectedDriver = drivers.find(d => d.code === selectedValue);
    
    return (
      <View style={{ marginBottom: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {drivers.map((driver) => {
              const isSelected = selectedValue === driver.code;
              return (
                <TouchableOpacity
                  key={driver.code}
                  onPress={() => onValueChange(driver.code)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: isSelected ? '#dc2626' : '#1f2937',
                    borderWidth: 1,
                    borderColor: isSelected ? '#dc2626' : '#374151',
                    minWidth: 60,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    color: isSelected ? '#fff' : '#9ca3af',
                    fontWeight: isSelected ? 'bold' : 'normal',
                    fontSize: 12,
                  }}>
                    {driver.code}
                  </Text>
                  <Text style={{
                    color: isSelected ? '#fff' : '#9ca3af',
                    fontSize: 10,
                    opacity: 0.8,
                  }}>
                    {driver.name?.split(' ').pop() || driver.code}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderChart = () => {
    if (!shouldLoadChart) {
      return (
        <View style={{
          height: 280,
          backgroundColor: '#111827',
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 16,
        }}>
          <Text style={{ color: '#9ca3af', fontSize: 16, marginBottom: 16, textAlign: 'center' }}>
            Click load to view sector comparison for selected drivers
          </Text>
          <TouchableOpacity
            onPress={loadComparisonData}
            style={{
              backgroundColor: '#dc2626',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            disabled={loading}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
              {loading ? 'Loading...' : 'Load Circuit Chart'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (loading) {
      return (
        <View style={{
          height: 280,
          backgroundColor: '#111827',
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 16,
        }}>
          <Text style={{ color: '#fff', fontSize: 16 }}>Loading...</Text>
        </View>
      );
    }

    if (!comparisonData) {
      return (
        <View style={{
          height: 280,
          backgroundColor: '#111827',
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 16,
        }}>
          <Text style={{ color: '#f87171', fontSize: 16 }}>
            Failed to load comparison data
          </Text>
        </View>
      );
    }

    // Get driver colors (simplified for React Native)
    const getDriverColor = (driverCode: string) => {
      const colors: { [key: string]: string } = {
        'VER': '#0600EF',
        'PER': '#0600EF',
        'HAM': '#00D2BE',
        'RUS': '#00D2BE',
        'LEC': '#DC143C',
        'SAI': '#DC143C',
        'NOR': '#FF8700',
        'PIA': '#FF8700',
        'ALO': '#006F62',
        'STR': '#006F62',
        'default': '#FFFFFF'
      };
      return colors[driverCode] || colors.default;
    };

    const driver1Color = getDriverColor(selectedDriver1);
    const driver2Color = getDriverColor(selectedDriver2);

    return (
      <View style={{ marginTop: 16 }}>
        <View style={{
          backgroundColor: '#111827',
          borderRadius: 12,
          padding: 16,
        }}>
          <Text style={{
            color: '#fff',
            fontSize: 18,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 16,
          }}>
            Track Dominance
          </Text>
          
          {/* Legend */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginBottom: 20,
            paddingHorizontal: 16,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
              <View style={{
                width: 16,
                height: 4,
                backgroundColor: driver1Color,
                borderRadius: 2,
                marginRight: 8,
              }} />
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                {selectedDriver1} Advantage
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
              <View style={{
                width: 16,
                height: 4,
                backgroundColor: driver2Color,
                borderRadius: 2,
                marginRight: 8,
              }} />
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                {selectedDriver2} Advantage
              </Text>
            </View>
          </View>

          {/* Circuit SVG */}
          <View style={{
            backgroundColor: '#1f2937',
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            alignItems: 'center',
          }}>
            <Text style={{
              color: '#fff',
              fontSize: 16,
              fontWeight: 'bold',
              marginBottom: 12,
            }}>
              {selectedDriver1} vs {selectedDriver2} - Fastest Lap Comparison
            </Text>
            <Svg
              width={Dimensions.get('window').width - 96}
              height={300}
              viewBox="0 0 1000 500"
              style={{
                backgroundColor: '#0f172a',
                borderRadius: 8,
              }}
            >
              <G transform="scale(1,-1) translate(0,-500)">
                {/* Circuit base outline */}
                <Path
                  d={comparisonData.circuitLayout}
                  fill="none"
                  stroke="rgba(75, 85, 99, 0.6)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Circuit sections highlighting advantages */}
                {comparisonData.sections.map((section) => {
                  let strokeColor = "rgba(75, 85, 99, 0.6)"; // Gray for neutral
                  let strokeWidth = 6;
                  
                  if (Math.abs(section.driver1Advantage) > 0.01) {
                    strokeWidth = 12;
                    if (section.driver1Advantage > 0) {
                      // Driver 1 (selectedDriver1) advantage
                      strokeColor = driver1Color;
                    } else {
                      // Driver 2 (selectedDriver2) advantage
                      strokeColor = driver2Color;
                    }
                  }

                  return (
                    <Path
                      key={section.id}
                      d={section.path}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={Math.abs(section.driver1Advantage) > 0.01 ? 0.9 : 0.6}
                    />
                  );
                })}
              </G>
            </Svg>
          </View>

          {/* Sector advantage details */}
          <View>
            <Text style={{
              color: '#fff',
              fontSize: 16,
              fontWeight: 'bold',
              marginBottom: 12,
            }}>
              Sector Analysis
            </Text>
            {comparisonData.sections.map((section) => {
              const advantage = section.driver1Advantage;
              const advantageDriver = advantage > 0 ? selectedDriver1 : selectedDriver2;
              const advantageColor = advantage > 0 ? driver1Color : driver2Color;
              const isNeutral = Math.abs(advantage) < 0.01;
              
              return (
                <View key={section.id} style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 6,
                  borderBottomWidth: 1,
                  borderBottomColor: '#374151',
                }}>
                  <Text style={{ color: '#9ca3af', fontSize: 14, flex: 1 }}>
                    {section.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      width: 8,
                      height: 8,
                      backgroundColor: isNeutral ? '#FFFF00' : advantageColor,
                      borderRadius: 4,
                      marginRight: 8,
                    }} />
                    <Text style={{
                      color: isNeutral ? '#9ca3af' : '#fff',
                      fontSize: 14,
                      fontWeight: '600',
                      minWidth: 100,
                      textAlign: 'right',
                    }}>
                      {isNeutral 
                        ? 'Neutral' 
                        : `${advantageDriver} +${Math.abs(advantage).toFixed(3)}s`
                      }
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View>
      <Text style={[commonStyles.title, { marginBottom: 16, textAlign: 'center' }]}>
        Circuit Comparison
      </Text>
      
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={{ color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>
          Driver 1:
        </Text>
        {renderDriverSelector(
          selectedDriver1,
          setSelectedDriver1,
          'Select first driver'
        )}

        <Text style={{ color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>
          Driver 2:
        </Text>
        {renderDriverSelector(
          selectedDriver2,
          setSelectedDriver2,
          'Select second driver'
        )}

        {renderChart()}
      </View>
    </View>
  );
};

export default CircuitComparisonChart;
