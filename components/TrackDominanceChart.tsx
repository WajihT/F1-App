import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Dimensions, Modal, ActivityIndicator } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryContainer } from 'victory-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { fetchSessionDrivers, fetchSpeedData } from '../lib/api';
import { SessionDriver } from '../lib/types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface SpeedDataPoint {
  Distance: number;
  Speed: number;
}

interface TrackDominanceChartProps {
  year: number;
  event: string;
  session: string;
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

const MIN_DRIVERS = 2;
const MAX_DRIVERS = 2;

const TrackDominanceChart: React.FC<TrackDominanceChartProps> = ({
  year,
  event,
  session,
}) => {
  const [drivers, setDrivers] = useState<SessionDriver[]>([]);
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [selectedLap1, setSelectedLap1] = useState<string | number>('fastest');
  const [selectedLap2, setSelectedLap2] = useState<string | number>('fastest');
  const [speedData1, setSpeedData1] = useState<SpeedDataPoint[]>([]);
  const [speedData2, setSpeedData2] = useState<SpeedDataPoint[]>([]);
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
      loadSpeedComparisonData();
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
          Alert.alert('Maximum Drivers', `You can select exactly ${MAX_DRIVERS} drivers. Deselect one first.`);
          return prev;
        }
      }

      // Only reset chart loading state if the chart was already loaded and we're changing the selection
      // This prevents hiding already loaded charts when selecting drivers for other charts
      if (shouldLoadChart && (speedData1.length > 0 || speedData2.length > 0)) {
        setShouldLoadChart(false);
        setSpeedData1([]);
        setSpeedData2([]);
      }
      
      return newSelection;
    });
  };

  const handleDriverModalClose = () => {
    setDriverModalVisible(false);
  };

  const loadSpeedComparisonData = async () => {
    if (selectedDrivers.length !== MIN_DRIVERS) {
      Alert.alert('Error', `Please select exactly ${MIN_DRIVERS} drivers`);
      return;
    }

    setLoading(true);
    setShouldLoadChart(true);
    
    try {
      const lapNumber1 = selectedLap1 === 'fastest' ? undefined : Number(selectedLap1);
      const lapNumber2 = selectedLap2 === 'fastest' ? undefined : Number(selectedLap2);
      
      const [data1, data2] = await Promise.all([
        fetchSpeedData(year, event, session, selectedDrivers[0], lapNumber1),
        fetchSpeedData(year, event, session, selectedDrivers[1], lapNumber2)
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

  const renderDriverSelector = () => (
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
            Select Drivers ({selectedDrivers.length}/{MAX_DRIVERS})
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
            {selectedDrivers.length === 0
              ? `Choose exactly ${MIN_DRIVERS} drivers to compare`
              : selectedDrivers.length < MIN_DRIVERS
              ? selectedDrivers.join(' vs ') + ` (need ${MIN_DRIVERS - selectedDrivers.length} more)`
              : selectedDrivers.join(' vs ')
            }
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color={colors.grey} />
      </TouchableOpacity>
    </View>
  );

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
                Select Drivers
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                Choose exactly {MIN_DRIVERS} drivers to compare track dominance
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
                ? `Select ${MIN_DRIVERS} drivers to compare`
                : selectedDrivers.length < MIN_DRIVERS 
                ? `Select ${MIN_DRIVERS - selectedDrivers.length} more driver${MIN_DRIVERS - selectedDrivers.length !== 1 ? 's' : ''} to compare`
                : selectedDrivers.length === MAX_DRIVERS
                ? 'Ready to compare! Close to proceed.'
                : `Select ${MIN_DRIVERS} drivers to compare`
              }
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );

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
            disabled={loading || selectedDrivers.length !== MIN_DRIVERS}
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

    // Prepare data for Victory Chart
    const chartData = [
      {
        driver: selectedDrivers[0],
        color: getDriverColor(selectedDrivers[0], year),
        data: combinedData.map(point => ({
          x: point.distance,
          y: point.speed1,
        }))
      },
      {
        driver: selectedDrivers[1],
        color: getDriverColor(selectedDrivers[1], year),
        data: combinedData.map(point => ({
          x: point.distance,
          y: point.speed2,
        }))
      }
    ];

    // Calculate domains for better visualization
    const allSpeeds = combinedData.flatMap(point => [point.speed1, point.speed2]);
    const minSpeed = Math.min(...allSpeeds);
    const maxSpeed = Math.max(...allSpeeds);
    const yDomain: [number, number] = [minSpeed - 5, maxSpeed + 10]; // Add 10 km/h to max speed as requested

    // Calculate X-axis domain based on the maximum distance from both drivers
    const maxDistance1 = speedData1.length > 0 ? speedData1[speedData1.length - 1].Distance : 0;
    const maxDistance2 = speedData2.length > 0 ? speedData2[speedData2.length - 1].Distance : 0;
    const maxDistance = Math.max(maxDistance1, maxDistance2);
    const minDistance = Math.min(speedData1[0]?.Distance || 0, speedData2[0]?.Distance || 0);
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
          
          
          {/* Driver comparison info */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 16,
            paddingHorizontal: 20,
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: getDriverColor(selectedDrivers[0], year), fontSize: 16, fontWeight: 'bold' }}>
                {selectedDrivers[0]}
              </Text>
              <Text style={{ color: '#9ca3af', fontSize: 12 }}>
                {selectedLap1 === 'fastest' ? 'Fastest' : `Lap ${selectedLap1}`}
              </Text>
            </View>
            <Text style={{ color: '#9ca3af', fontSize: 14, alignSelf: 'center' }}>vs</Text>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: getDriverColor(selectedDrivers[1], year), fontSize: 16, fontWeight: 'bold' }}>
                {selectedDrivers[1]}
              </Text>
              <Text style={{ color: '#9ca3af', fontSize: 12 }}>
                {selectedLap2 === 'fastest' ? 'Fastest' : `Lap ${selectedLap2}`}
              </Text>
            </View>
          </View>

          {/* Victory Chart */}
          <View style={{ alignItems: 'center' }}>
            <VictoryChart
              height={chartHeight}
              width={chartWidth}
              padding={{ left: 50, top: 20, right: 20, bottom: 60 }}
              domain={{ x: xDomain, y: yDomain }}
              containerComponent={
                <VictoryContainer 
                  style={{ 
                    touchAction: "auto",
                    backgroundColor: "transparent"
                  }}
                />
              }
            >
              {/* X-axis (Distance) */}
              <VictoryAxis
                dependentAxis={false}
                style={{
                  axis: { stroke: colors.grey },
                  tickLabels: { 
                    fill: colors.textSecondary, 
                    fontSize: 10,
                    angle: 0
                  },
                  grid: { stroke: colors.grey, strokeOpacity: 0.2 }
                }}
                tickFormat={(t) => `${Math.round(t)}m`}
                tickCount={6}
              />
              
              {/* Y-axis (Speed) */}
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: colors.grey },
                  tickLabels: { 
                    fill: colors.textSecondary, 
                    fontSize: 10
                  },
                  grid: { stroke: colors.grey, strokeOpacity: 0.2 }
                }}
                tickFormat={(t) => `${Math.round(t)}`}
                tickCount={6}
              />

              {/* Line for each driver */}
              {chartData.map(({ driver, color, data }) => {
                if (data.length === 0) return null;
                
                return (
                  <VictoryLine
                    key={driver}
                    data={data}
                    style={{
                      data: { 
                        stroke: color, 
                        strokeWidth: 2.5,
                        strokeLinecap: "round",
                        strokeLinejoin: "round"
                      }
                    }}
                    animate={{
                      duration: 1000,
                      onLoad: { duration: 500 }
                    }}
                  />
                );
              })}
            </VictoryChart>
          </View>

          {/* Legend */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 16,
            gap: 20,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 16,
                height: 3,
                backgroundColor: getDriverColor(selectedDrivers[0], year),
                borderRadius: 2,
                marginRight: 8,
              }} />
              <Text style={{ color: '#fff', fontSize: 14 }}>
                {selectedDrivers[0]}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 16,
                height: 3,
                backgroundColor: getDriverColor(selectedDrivers[1], year),
                borderRadius: 2,
                marginRight: 8,
              }} />
              <Text style={{ color: '#fff', fontSize: 14 }}>
                {selectedDrivers[1]}
              </Text>
            </View>
          </View>
          
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 8,
          }}>
            <Text style={{ color: '#9ca3af', fontSize: 12 }}>
              Speed (km/h) vs Distance (m)
            </Text>
          </View>
        </View>
      </View>
    );
  };

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
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Load Track Dominance</Text>
      </TouchableOpacity>
      <Text style={{ 
        color: colors.textSecondary, 
        fontSize: 13, 
        marginTop: 12, 
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: 20
      }}>
        Select exactly 2 drivers and click load to view track dominance comparison
      </Text>
    </View>
  );

  const renderContent = () => {
    if (error) {
      return (
        <View style={{ alignItems: 'center', padding: 20 }}>
          <MaterialIcons name="error-outline" size={48} color={colors.warning} />
          <Text style={{ color: colors.warning, fontSize: 16, fontWeight: 'bold', marginTop: 12 }}>
            Error Loading Data
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4, textAlign: 'center' }}>
            {error}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: colors.backgroundAlt,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 6,
              marginTop: 12,
            }}
            onPress={() => setShouldLoadChart(false)}
          >
            <Text style={{ color: '#fff', fontSize: 14 }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (isLoadingDrivers) {
      return (
        <View style={{ alignItems: 'center', padding: 40 }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Loading drivers...</Text>
        </View>
      );
    }

    if (!shouldLoadChart) {
      return (
        <View>
          {renderDriverSelector()}
          {renderLoadButton()}
        </View>
      );
    }

    if (loading) {
      return (
        <View>
          {renderDriverSelector()}
          <View style={{ alignItems: 'center', padding: 40 }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Loading track dominance...</Text>
          </View>
        </View>
      );
    }

    if (!speedData1.length || !speedData2.length) {
      return (
        <View>
          {renderDriverSelector()}
          <View style={{ alignItems: 'center', padding: 20 }}>
            <MaterialIcons name="info" size={48} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontSize: 16, marginTop: 8 }}>
              No speed data available
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View>
        {renderDriverSelector()}
        {renderChart()}
      </View>
    );
  };

  return (
    <>
      <View style={{ padding: 0, backgroundColor: "transparent" }}>
        <Text style={[commonStyles.title, { marginBottom: 4, textAlign: 'center' }]}>
          Track Dominance
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
          by Lap with Speed Trace
        </Text>
        {renderContent()}
      </View>
      {renderDriverModal()}
    </>
  );
};

export default TrackDominanceChart;
