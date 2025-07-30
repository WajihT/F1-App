import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { commonStyles } from '../styles/commonStyles';
import { fetchSessionDrivers, fetchSpeedData } from '../lib/api';
import { SessionDriver } from '../lib/types';

interface SpeedDataPoint {
  Distance: number;
  Speed: number;
}

interface TrackDominanceChartProps {
  year: number;
  event: string;
  session: string;
}

const TrackDominanceChart: React.FC<TrackDominanceChartProps> = ({
  year,
  event,
  session,
}) => {
  const [drivers, setDrivers] = useState<SessionDriver[]>([]);
  const [selectedDriver1, setSelectedDriver1] = useState<string>('');
  const [selectedDriver2, setSelectedDriver2] = useState<string>('');
  const [selectedLap1, setSelectedLap1] = useState<string | number>('fastest');
  const [selectedLap2, setSelectedLap2] = useState<string | number>('fastest');
  const [speedData1, setSpeedData1] = useState<SpeedDataPoint[]>([]);
  const [speedData2, setSpeedData2] = useState<SpeedDataPoint[]>([]);
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

  const loadSpeedComparisonData = async () => {
    if (!selectedDriver1 || !selectedDriver2 || selectedDriver1 === selectedDriver2) {
      Alert.alert('Error', 'Please select two different drivers');
      return;
    }

    setLoading(true);
    setShouldLoadChart(true);
    
    try {
      const lapNumber1 = selectedLap1 === 'fastest' ? undefined : Number(selectedLap1);
      const lapNumber2 = selectedLap2 === 'fastest' ? undefined : Number(selectedLap2);
      
      const [data1, data2] = await Promise.all([
        fetchSpeedData(year, event, session, selectedDriver1, lapNumber1),
        fetchSpeedData(year, event, session, selectedDriver2, lapNumber2)
      ]);
      
      setSpeedData1(data1);
      setSpeedData2(data2);
    } catch (error) {
      console.error('Failed to fetch speed comparison data:', error);
      Alert.alert('Error', 'Failed to load speed comparison data');
    } finally {
      setLoading(false);
    }
  };

  const renderDriverSelector = (
    selectedValue: string,
    onValueChange: (value: string) => void,
    placeholder: string
  ) => {
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
            Click load to view track dominance comparison
          </Text>
          <TouchableOpacity
            onPress={loadSpeedComparisonData}
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
              {loading ? 'Loading...' : 'Load Track Dominance'}
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

    if (!speedData1.length || !speedData2.length) {
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
            Failed to load speed comparison data
          </Text>
        </View>
      );
    }

    // Combine speed data for comparison
    const combinedData = [];
    const maxLength = Math.max(speedData1.length, speedData2.length);
    
    for (let i = 0; i < maxLength; i++) {
      const point1 = speedData1[i];
      const point2 = speedData2[i];
      
      if (point1 && point2) {
        combinedData.push({
          distance: point1.Distance,
          speed1: point1.Speed,
          speed2: point2.Speed,
        });
      }
    }

    const chartData = {
      labels: combinedData.filter((_, index) => index % Math.ceil(combinedData.length / 6) === 0)
        .map(point => `${Math.round(point.distance)}m`),
      datasets: [
        {
          data: combinedData.map(point => point.speed1),
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue for driver 1
          strokeWidth: 2,
        },
        {
          data: combinedData.map(point => point.speed2),
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red for driver 2
          strokeWidth: 2,
        },
      ],
    };

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
            Track Dominance by Lap with Speed Trace
          </Text>
          
          {/* Driver comparison info */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 16,
            paddingHorizontal: 20,
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#3b82f6', fontSize: 16, fontWeight: 'bold' }}>
                {selectedDriver1}
              </Text>
              <Text style={{ color: '#9ca3af', fontSize: 12 }}>
                {selectedLap1 === 'fastest' ? 'Fastest' : `Lap ${selectedLap1}`}
              </Text>
            </View>
            <Text style={{ color: '#9ca3af', fontSize: 14, alignSelf: 'center' }}>vs</Text>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#ef4444', fontSize: 16, fontWeight: 'bold' }}>
                {selectedDriver2}
              </Text>
              <Text style={{ color: '#9ca3af', fontSize: 12 }}>
                {selectedLap2 === 'fastest' ? 'Fastest' : `Lap ${selectedLap2}`}
              </Text>
            </View>
          </View>

          {/* Legend */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 16,
            gap: 20,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 12,
                height: 12,
                backgroundColor: '#3b82f6',
                borderRadius: 2,
                marginRight: 8,
              }} />
              <Text style={{ color: '#fff', fontSize: 14 }}>
                {selectedDriver1} Advantage
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 12,
                height: 12,
                backgroundColor: '#ef4444',
                borderRadius: 2,
                marginRight: 8,
              }} />
              <Text style={{ color: '#fff', fontSize: 14 }}>
                {selectedDriver2} Advantage
              </Text>
            </View>
          </View>

          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 64}
            height={200}
            chartConfig={{
              backgroundColor: '#111827',
              backgroundGradientFrom: '#111827',
              backgroundGradientTo: '#111827',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '0',
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
          
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 8,
          }}>
            <Text style={{ color: '#9ca3af', fontSize: 14 }}>
              Speed (km/h)
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View>
      <Text style={[commonStyles.title, { marginBottom: 16, textAlign: 'center' }]}>
        Track Dominance by Lap with Speed Trace
      </Text>
      
      <View>
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

export default TrackDominanceChart;
