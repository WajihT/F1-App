import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Dimensions, Modal, ActivityIndicator } from 'react-native';
import { VictoryChart, VictoryArea, VictoryAxis, VictoryTheme } from 'victory-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { fetchSessionDrivers, fetchBrakeData } from '../lib/api';
import { SessionDriver } from '../lib/types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface BrakeDataPoint {
  Distance: number;
  Brake: number;
}

interface BrakeChartProps {
  year: number;
  event: string;
  session: string;
  initialDriver?: string;
  lap?: string | number;
}

// Team mapping for 2024 season
const getDriverTeam = (driverCode: string, year: number): string => {
  const teams2024: { [key: string]: string } = {
    VER: 'Red Bull Racing',
    PER: 'Red Bull Racing',
    TSU: 'Red Bull Racing',
    RUS: 'Mercedes',
    ANT: 'Mercedes',
    HAM: 'Ferrari', // Updated for 2025
    LEC: 'Ferrari',
    NOR: 'McLaren',
    PIA: 'McLaren',
    ALO: 'Aston Martin',
    STR: 'Aston Martin',
    GAS: 'Alpine',
    COL: 'Alpine',
    ALB: 'Williams',
    SAR: 'Williams',
    SAI: 'Williams', // Updated for 2025
    BEA: 'Haas',
    OCO: 'Haas', // Updated for 2025
    LAW: 'RB',
    RIC: 'RB',
    HAD: 'RB',
    ZHO: 'Kick Sauber',
    BOT: 'Kick Sauber',
    HUL: 'Kick Sauber', // Updated for 2025
    BOR: 'Kick Sauber',
  };
  
  return teams2024[driverCode] || 'Unknown Team';
};

// Driver colors mapping (similar to your web version)
const getDriverColor = (driverCode: string, year: number): string => {
  const colors2024: { [key: string]: string } = {
    VER: '#0600EF', // Red Bull
    PER: '#0600EF',
    TSU: '#0600EF',
    RUS: '#00D2BE', // Mercedes
    HAM: '#DC143C', // Ferrari (2025)
    ANT: '#00D2BE', // Mercedes
    LEC: '#DC143C', // Ferrari
    SAI: '#005AFF', // Williams (2025)
    NOR: '#FF8700', // McLaren
    PIA: '#FF8700',
    ALO: '#006F62', // Aston Martin
    STR: '#006F62',
    GAS: '#0090FF', // Alpine
    OCO: '#FFFFFF', // Haas (2025)
    COL: '#0090FF', // Alpine
    ALB: '#005AFF', // Williams
    SAR: '#005AFF', // Williams
    BEA: '#FFFFFF', // Haas
    HUL: '#52E252', // Kick Sauber (2025)
    LAW: '#6692FF', // RB
    RIC: '#6692FF', // RB
    HAD: '#6692FF',
    ZHO: '#52E252', // Kick Sauber
    BOT: '#52E252',
    BOR: '#52E252',
  };

  return colors2024[driverCode] || '#9CA3AF';
};

const MIN_DRIVERS = 1;
const MAX_DRIVERS = 1;

const BrakeChart: React.FC<BrakeChartProps> = ({
  year,
  event,
  session,
  initialDriver = '',
  lap = 'fastest'
}) => {
  const [drivers, setDrivers] = useState<SessionDriver[]>([]);
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [selectedLap, setSelectedLap] = useState<string | number>(lap);
  const [brakeData, setBrakeData] = useState<BrakeDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [shouldLoadChart, setShouldLoadChart] = useState(false);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [driverModalVisible, setDriverModalVisible] = useState(false);

  // Fetch available drivers
  useEffect(() => {
    const loadDrivers = async () => {
      if (!year || !event || !session) return;
      
      setIsLoadingDrivers(true);
      setError(null);
      
      try {
        const sessionDrivers = await fetchSessionDrivers(year, event, session);
        setDrivers(sessionDrivers);
        
        // Don't auto-select drivers - let users choose manually for each chart
        // This prevents conflicts when multiple charts are on the same screen
      } catch (err) {
        console.error('Failed to fetch drivers:', err);
        setError('Failed to load drivers');
      } finally {
        setIsLoadingDrivers(false);
      }
    };

    loadDrivers();
  }, [year, event, session]);

  // Load chart when requested
  useEffect(() => {
    if (shouldLoadChart && selectedDrivers.length === MIN_DRIVERS) {
      loadBrakeData();
    }
  }, [shouldLoadChart, selectedDrivers, year, event, session]);

  // Handle driver selection
  const toggleDriverSelection = (driverCode: string) => {
    setSelectedDrivers(prev => {
      const isSelected = prev.includes(driverCode);
      let newSelection: string[];

      if (isSelected) {
        // Always allow deselecting drivers
        newSelection = prev.filter(d => d !== driverCode);
      } else {
        // Add driver only if we haven't reached maximum
        if (prev.length < MAX_DRIVERS) {
          newSelection = [...prev, driverCode];
        } else {
          // For single driver selection, replace the current selection
          newSelection = [driverCode];
        }
      }

      // Only reset chart loading state if the chart was already loaded and we're changing the selection
      // This prevents hiding already loaded charts when selecting drivers for other charts
      if (shouldLoadChart && brakeData.length > 0) {
        setShouldLoadChart(false);
        setBrakeData([]);
      }
      
      return newSelection;
    });
  };

  const handleDriverModalClose = () => {
    setDriverModalVisible(false);
  };

  const loadBrakeData = async () => {
    if (selectedDrivers.length !== MIN_DRIVERS) {
      Alert.alert('Error', `Please select a driver`);
      return;
    }

    setLoading(true);
    setShouldLoadChart(true);
    
    try {
      const lapNumber = selectedLap === 'fastest' ? undefined : Number(selectedLap);
      const data = await fetchBrakeData(year, event, session, selectedDrivers[0], lapNumber);
      setBrakeData(data);
    } catch (error) {
      console.error('Failed to fetch brake data:', error);
      Alert.alert('Error', 'Failed to load brake data');
    } finally {
      setLoading(false);
    }
  };

  const renderDriverModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={driverModalVisible}
      onRequestClose={handleDriverModalClose}
    >
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      }}>
        <View style={{
          backgroundColor: '#141422',
          borderRadius: 20,
          padding: 24,
          margin: 20,
          maxHeight: '80%',
          width: '90%',
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          {/* Modal Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 20,
          }}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 }}>
                Select Driver
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                Choose a driver to analyze brake data
              </Text>
            </View>
            <TouchableOpacity 
              onPress={handleDriverModalClose}
              style={{
                padding: 6,
                borderRadius: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: -4,
                marginRight: -4,
              }}
            >
              <MaterialIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Driver Selection */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {drivers.map((driver) => {
              const isSelected = selectedDrivers.includes(driver.code);
              const driverColor = getDriverColor(driver.code, year);
              
              return (
                <TouchableOpacity
                  key={driver.code}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    marginBottom: 8,
                    backgroundColor: isSelected ? driverColor + '20' : '#202534ff',
                    borderRadius: 12,
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected ? driverColor : colors.border,
                  }}
                  onPress={() => toggleDriverSelection(driver.code)}
                  disabled={isLoadingDrivers}
                >
                  <View style={{ marginRight: 12, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: driverColor + '30', borderRadius: 20 }}>
                    <Text style={{ color: driverColor, fontWeight: 'bold', fontSize: 14 }}>
                      {driver.code}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
                      {driver.name}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                      {getDriverTeam(driver.code, year)}
                    </Text>
                  </View>
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: driverColor,
                    marginLeft: 8,
                  }} />
                  {isSelected && (
                    <MaterialIcons 
                      name="check-circle" 
                      size={24} 
                      color={driverColor}
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Selection Info */}
          <View style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: selectedDrivers.length === MAX_DRIVERS ? '#002f42' : '#7d2629',
            borderRadius: 8,
          }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12, textAlign: 'center' }}>
              {selectedDrivers.length === 0
                ? `Select a driver to analyze`
                : selectedDrivers.length === MAX_DRIVERS
                ? 'Ready to analyze! Close to proceed.'
                : `Select a driver to analyze`
              }
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderLoadButton = () => (
    <View style={{ alignItems: 'center', marginVertical: 20 }}>
      <TouchableOpacity
        style={{
          backgroundColor: '#2a2d3a',
          paddingHorizontal: 32,
          paddingVertical: 16,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          width: '100%',
          maxWidth: 280,
          borderWidth: 1,
          borderColor: '#3a3f4e',
        }}
        onPress={() => setShouldLoadChart(true)}
        disabled={selectedDrivers.length !== MIN_DRIVERS || isLoadingDrivers}
      >
        <MaterialIcons name="speed" size={20} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Load Brake Chart</Text>
      </TouchableOpacity>
      <Text style={{ 
        color: colors.textSecondary, 
        fontSize: 13, 
        marginTop: 12, 
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: 20
      }}>
        Select a driver and click load to view brake analysis
      </Text>
    </View>
  );

  const renderChart = () => {
    if (!shouldLoadChart) {
      return renderLoadButton();
    }

    if (loading) {
      return (
        <View style={{
          height: 280,
          backgroundColor: 'transparent',
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 16,
        }}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={{ color: '#fff', fontSize: 16, marginTop: 12 }}>Loading...</Text>
        </View>
      );
    }

    if (!brakeData || brakeData.length === 0) {
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
            No brake data found for {selectedDrivers[0]} lap {selectedLap}
          </Text>
        </View>
      );
    }

    const selectedDriverColor = getDriverColor(selectedDrivers[0], year);
    
    // Prepare data for Victory Chart
    const chartData = brakeData.map((point, index) => ({
      x: point.Distance,
      y: point.Brake,
    }));

    // Calculate domains for better visualization
    const allBrakeValues = brakeData.map(point => point.Brake);
    const minBrake = Math.min(...allBrakeValues);
    const maxBrake = Math.max(...allBrakeValues);
    const yDomain: [number, number] = [Math.max(0, minBrake - 5), Math.min(100, maxBrake + 5)];

    // Calculate X-axis domain
    const maxDistance = brakeData.length > 0 ? brakeData[brakeData.length - 1].Distance : 0;
    const minDistance = brakeData[0]?.Distance || 0;
    const xDomain: [number, number] = [minDistance, maxDistance];

    const chartHeight = 300;
    const chartWidth = Dimensions.get('window').width - 32;

    return (
      <View style={{ marginTop: 16 }}>
        <View style={{
          backgroundColor: 'transparent',
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
            {selectedDrivers[0]}'s {selectedLap === 'fastest' ? 'Fastest Lap' : `Lap ${selectedLap}`} Brake Input
          </Text>
          
          {/* Victory Chart */}
          <View style={{ alignItems: 'center' }}>
            <VictoryChart
              theme={VictoryTheme.material}
              width={chartWidth}
              height={chartHeight}
              domain={{ x: xDomain, y: yDomain }}
              padding={{ left: 60, top: 20, right: 40, bottom: 60 }}
            >
              {/* Background grid */}
              <VictoryAxis
                dependentAxis
                tickFormat={(t) => `${t}%`}
                style={{
                  axis: { stroke: '#374151' },
                  tickLabels: { fontSize: 12, fill: '#9ca3af' },
                  grid: { stroke: '#374151', strokeWidth: 0.5 }
                }}
              />
              <VictoryAxis
                tickFormat={(t) => `${Math.round(t/1000)}k`}
                style={{
                  axis: { stroke: '#374151' },
                  tickLabels: { fontSize: 12, fill: '#9ca3af' },
                  grid: { stroke: '#374151', strokeWidth: 0.5 }
                }}
              />
              
              {/* Brake area chart */}
              <VictoryArea
                data={chartData}
                style={{
                  data: {
                    fill: selectedDriverColor + '40',
                    fillOpacity: 0.6,
                    stroke: selectedDriverColor,
                    strokeWidth: 2,
                  }
                }}
                interpolation="natural"
              />
            </VictoryChart>
          </View>
          
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 8,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 12,
                height: 12,
                backgroundColor: selectedDriverColor,
                borderRadius: 2,
                marginRight: 8,
              }} />
              <Text style={{ color: '#9ca3af', fontSize: 14 }}>
                Brake Pressure (0-100%)
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View>
      {renderDriverModal()}
      
      <Text style={[commonStyles.title, { marginBottom: 16, textAlign: 'center' }]}>
        Brake Analysis
      </Text>
      
      <View>
        <View style={{ marginBottom: 20 }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              backgroundColor: "#14141c",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#212a39",
            }}
            onPress={() => setDriverModalVisible(true)}
          >
            <View style={{ 
              backgroundColor: colors.primary + '20',
              borderRadius: 12,
              padding: 8,
              marginRight: 16,
            }}>
              <MaterialIcons name="people" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                {selectedDrivers.length === 0 ? 'Select Driver' : `${selectedDrivers[0]} Selected`}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                {selectedDrivers.length === 0
                  ? 'Choose a driver to analyze brake data'
                  : `Ready to analyze ${selectedDrivers[0]}'s brake data`
                }
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.grey} />
          </TouchableOpacity>
        </View>
        
        {renderChart()}
      </View>
    </View>
  );
};

export default BrakeChart;
