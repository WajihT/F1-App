import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { commonStyles } from '../styles/commonStyles';
import { fetchSessionDrivers, fetchDRSData } from '../lib/api';
import { SessionDriver } from '../lib/types';

interface DRSDataPoint {
  Distance: number;
  DRS: number;
}

interface DRSChartProps {
  year: number;
  event: string;
  session: string;
  initialDriver?: string;
  lap?: string | number;
}

const DRSChart: React.FC<DRSChartProps> = ({
  year,
  event,
  session,
  initialDriver = '',
  lap = 'fastest'
}) => {
  const [drivers, setDrivers] = useState<SessionDriver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string>(initialDriver);
  const [selectedLap, setSelectedLap] = useState<string | number>(lap);
  const [drsData, setDrsData] = useState<DRSDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [shouldLoadChart, setShouldLoadChart] = useState(false);

  // Fetch available drivers
  useEffect(() => {
    const loadDrivers = async () => {
      try {
        const sessionDrivers = await fetchSessionDrivers(year, event, session);
        setDrivers(sessionDrivers);
        
        if (!initialDriver && sessionDrivers.length > 0) {
          setSelectedDriver(sessionDrivers[0].code);
        }
      } catch (error) {
        console.error('Failed to fetch drivers:', error);
      }
    };

    if (year && event && session) {
      loadDrivers();
    }
  }, [year, event, session, initialDriver]);

  const loadDRSData = async () => {
    if (!selectedDriver) {
      Alert.alert('Error', 'Please select a driver');
      return;
    }

    setLoading(true);
    setShouldLoadChart(true);
    
    try {
      const lapNumber = selectedLap === 'fastest' ? undefined : Number(selectedLap);
      const data = await fetchDRSData(year, event, session, selectedDriver, lapNumber);
      setDrsData(data);
    } catch (error) {
      console.error('Failed to fetch DRS data:', error);
      Alert.alert('Error', 'Failed to load DRS data');
    } finally {
      setLoading(false);
    }
  };

  const renderDriverSelector = () => {
    const selectedDriverObj = drivers.find(d => d.code === selectedDriver);
    
    return (
      <View style={{ marginBottom: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {drivers.map((driver) => {
              const isSelected = selectedDriver === driver.code;
              return (
                <TouchableOpacity
                  key={driver.code}
                  onPress={() => setSelectedDriver(driver.code)}
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
            Click load to view DRS usage for selected driver
          </Text>
          <TouchableOpacity
            onPress={loadDRSData}
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
              {loading ? 'Loading...' : 'Load DRS Chart'}
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

    if (!drsData || drsData.length === 0) {
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
            No DRS data found for {selectedDriver} lap {selectedLap}
          </Text>
        </View>
      );
    }

    const chartData = {
      labels: drsData.filter((_, index) => index % Math.ceil(drsData.length / 6) === 0)
        .map(point => `${Math.round(point.Distance)}m`),
      datasets: [
        {
          data: drsData.map(point => point.DRS),
          color: (opacity = 1) => `rgba(220, 38, 38, ${opacity})`,
          strokeWidth: 3,
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
            {selectedDriver}'s {selectedLap === 'fastest' ? 'Fastest Lap' : `Lap ${selectedLap}`} DRS Usage
          </Text>
          
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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 12,
                height: 12,
                backgroundColor: '#dc2626',
                borderRadius: 2,
                marginRight: 8,
              }} />
              <Text style={{ color: '#9ca3af', fontSize: 14 }}>
                DRS Active (1 = On, 0 = Off)
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View>
      <Text style={[commonStyles.title, { marginBottom: 16, textAlign: 'center' }]}>
        DRS Usage Analysis
      </Text>
      
      <View>
        <Text style={{ color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>
          Driver:
        </Text>
        {renderDriverSelector()}
        
        {renderChart()}
      </View>
    </View>
  );
};

export default DRSChart;
