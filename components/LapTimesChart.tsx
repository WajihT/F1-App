import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryLegend, VictoryContainer } from 'victory-native';
import { commonStyles, colors, typography } from '../styles/commonStyles';
import { fetchLapTimes, fetchSessionDrivers } from '../lib/api';
import { LapTimeDataPoint, SessionDriver } from '../lib/types';
import LoadingSpinnerF1 from './LoadingSpinnerF1';
import Icon from './Icon';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import Svg, { Path, Rect } from 'react-native-svg';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// SVG Icon Components
const TableIcon = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 3v18" />
    <Rect width="18" height="18" x="3" y="3" rx="2" />
    <Path d="M3 9h18" />
    <Path d="M3 15h18" />
  </Svg>
);

const ChartLineIcon = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 3v16a2 2 0 0 0 2 2h16" />
    <Path d="m19 9-5 5-4-4-3 3" />
  </Svg>
);

interface LapTimesChartProps {
  year: number;
  event: string;
  session: string;
}

// Helper function to format seconds into MM:SS.mmm
const formatLapTime = (totalSeconds: number | null): string => {
  if (totalSeconds === null || isNaN(totalSeconds)) {
    return 'N/A';
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedSeconds = seconds.toFixed(3).padStart(6, '0');
  return `${minutes}:${formattedSeconds}`;
};

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
  // Add default color for any missing drivers if needed
};

  return colors2024[driverCode] || '#9CA3AF';
};

// Determine if driver should have dashed line (second driver of same team)
const getDriverLineStyle = (driverCode: string, selectedDrivers: string[], year: number): 'solid' | 'dashed' => {
  const driverTeam = getDriverTeam(driverCode, year);
  const teamMates = selectedDrivers.filter(driver => getDriverTeam(driver, year) === driverTeam);
  
  if (teamMates.length > 1) {
    // First occurrence gets solid line, second gets dashed
    const driverIndex = teamMates.indexOf(driverCode);
    return driverIndex === 0 ? 'solid' : 'dashed';
  }
  
  return 'solid';
};

const MIN_DRIVERS = 2;
const MAX_DRIVERS = 5;

const LapTimesChart: React.FC<LapTimesChartProps> = ({ year, event, session }) => {
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<SessionDriver[]>([]);
  const [lapData, setLapData] = useState<LapTimeDataPoint[]>([]);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);
  const [isLoadingLapTimes, setIsLoadingLapTimes] = useState(false);
  const [shouldLoadChart, setShouldLoadChart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [driverModalVisible, setDriverModalVisible] = useState(false);

  const screenWidth = Dimensions.get('window').width;

  // Fetch available drivers
  useEffect(() => {
    const loadDrivers = async () => {
      if (!year || !event || !session) return;
      
      setIsLoadingDrivers(true);
      setError(null);
      
      try {
        const drivers = await fetchSessionDrivers(year, event, session);
        setAvailableDrivers(drivers);
        
        // Auto-select first 2 drivers
        if (drivers.length >= MIN_DRIVERS && selectedDrivers.length === 0) {
          setSelectedDrivers(drivers.slice(0, MIN_DRIVERS).map((d: SessionDriver) => d.code));
        }
      } catch (err) {
        console.error('Failed to fetch drivers:', err);
        setError('Failed to load drivers');
      } finally {
        setIsLoadingDrivers(false);
      }
    };

    loadDrivers();
  }, [year, event, session]);

  // Fetch lap time data
  const loadLapTimes = async () => {
    if (selectedDrivers.length < MIN_DRIVERS) return;

    setIsLoadingLapTimes(true);
    setError(null);

    try {
      const data = await fetchLapTimes(year, event, session, selectedDrivers);
      setLapData(data);
    } catch (err) {
      console.error('Failed to fetch lap times:', err);
      setError('Failed to load lap times');
      setLapData([]);
    } finally {
      setIsLoadingLapTimes(false);
    }
  };

  // Load chart when requested
  useEffect(() => {
    if (shouldLoadChart && selectedDrivers.length >= MIN_DRIVERS) {
      loadLapTimes();
    }
  }, [shouldLoadChart, selectedDrivers, year, event, session]);

  // Handle driver selection
  const toggleDriverSelection = (driverCode: string) => {
    setSelectedDrivers(prev => {
      const isSelected = prev.includes(driverCode);
      let newSelection: string[];

      if (isSelected) {
        // Remove driver only if we have more than minimum
        if (prev.length > MIN_DRIVERS) {
          newSelection = prev.filter(d => d !== driverCode);
        } else {
          Alert.alert('Minimum Drivers', `Please select at least ${MIN_DRIVERS} drivers`);
          return prev;
        }
      } else {
        // Add driver only if we haven't reached maximum
        if (prev.length < MAX_DRIVERS) {
          newSelection = [...prev, driverCode];
        } else {
          Alert.alert('Maximum Drivers', `You can select up to ${MAX_DRIVERS} drivers`);
          return prev;
        }
      }

      // Reset chart loading state when selection changes
      setShouldLoadChart(false);
      return newSelection;
    });
  };

  const handleDriverModalClose = () => {
    setDriverModalVisible(false);
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
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500', fontFamily: typography.fontFamily.semiBold }}>
            Select Drivers ({selectedDrivers.length}/{MAX_DRIVERS})
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
            {selectedDrivers.length > 0 
              ? selectedDrivers.join(', ')
              : `Choose ${MIN_DRIVERS}-${MAX_DRIVERS} drivers to compare`
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
            alignItems: 'flex-start',
            marginBottom: 20,
            position: 'relative',
          }}>
            {/* Centered text container */}
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 22, fontWeight: '500', color: '#fff', marginBottom: 4, fontFamily: typography.fontFamily.semiBold, textAlign: 'center' }}>
                Select Drivers
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, fontFamily: typography.fontFamily.regular, textAlign: 'center' }}>
                Choose {MIN_DRIVERS}-{MAX_DRIVERS} drivers to compare lap times
              </Text>
            </View>
            {/* Absolutely positioned X button */}
            <TouchableOpacity 
              onPress={handleDriverModalClose}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
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
            {availableDrivers.map((driver) => {
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
            backgroundColor: selectedDrivers.length === MAX_DRIVERS ? '#7d2629' : '#002f42',
            borderRadius: 8,
          }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12, textAlign: 'center' }}>
              {selectedDrivers.length < MIN_DRIVERS 
                ? `Select at least ${MIN_DRIVERS - selectedDrivers.length} more driver${MIN_DRIVERS - selectedDrivers.length !== 1 ? 's' : ''}`
                : selectedDrivers.length === MAX_DRIVERS
                ? 'Maximum drivers selected'
                : `You can select ${MAX_DRIVERS - selectedDrivers.length} more driver${MAX_DRIVERS - selectedDrivers.length !== 1 ? 's' : ''}`
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
        disabled={selectedDrivers.length < MIN_DRIVERS || isLoadingDrivers}
      >
        <Feather name="bar-chart-2" size={20} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: '500', fontSize: 16, fontFamily: typography.fontFamily.semiBold }}>Load Chart</Text>
      </TouchableOpacity>
      <Text style={{ 
        color: colors.textSecondary, 
        fontSize: 11, 
        marginTop: 12, 
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: 20,
        fontFamily: typography.fontFamily.regular
      }}>
        Select drivers and click load to view lap time comparison
      </Text>
    </View>
  );

  const renderChart = () => {
    if (!lapData || lapData.length === 0) return null;

    // Prepare data for Victory Chart
    const chartData = selectedDrivers.map(driverCode => ({
      driver: driverCode,
      color: getDriverColor(driverCode, year),
      team: getDriverTeam(driverCode, year),
      lineStyle: getDriverLineStyle(driverCode, selectedDrivers, year),
      data: lapData
        .filter(lap => lap[driverCode] !== null && lap[driverCode] !== undefined)
        .map(lap => ({
          x: lap.LapNumber,
          y: lap[driverCode] as number,
        }))
        .filter(point => point.y > 0) // Filter out invalid times
    }));

    // Calculate Y-axis domain for better visualization
    const allTimes = chartData.flatMap(driver => driver.data.map(point => point.y));
    const minTime = Math.min(...allTimes);
    const maxTime = Math.max(...allTimes);
    const padding = (maxTime - minTime) * 0.05; // 5% padding
    const yDomain: [number, number] = [minTime - padding, maxTime + padding];

    // Calculate X-axis domain
    const allLaps = lapData.map(lap => lap.LapNumber);
    const minLap = Math.min(...allLaps);
    const maxLap = Math.max(...allLaps);

    const chartHeight = 300;
    const chartWidth = screenWidth - 40; // Account for padding

    return (
      <View style={{ marginVertical: 20 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ width: Math.max(chartWidth, maxLap * 15) }}>
            <VictoryChart
              height={chartHeight}
              width={Math.max(chartWidth, maxLap * 15)}
              padding={{ left: 40, top: 20, right: 5, bottom: 60 }}
              domain={{ x: [minLap, maxLap], y: yDomain }}
              containerComponent={
                <VictoryContainer 
                  style={{ 
                    touchAction: "auto",
                    backgroundColor: "transparent"
                  }}
                />
              }
            >
              {/* X-axis (Lap numbers) */}
              <VictoryAxis
                dependentAxis={false}
                style={{
                  axis: { stroke: colors.grey },
                  tickLabels: { 
                    fill: colors.textSecondary, 
                    fontSize: 12,
                    angle: 0
                  },
                  grid: { stroke: colors.grey, strokeOpacity: 0.3 }
                }}
                tickCount={Math.min(10, maxLap - minLap + 1)}
              />
              
              {/* Y-axis (Lap times) */}
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: colors.grey },
                  tickLabels: { 
                    fill: colors.textSecondary, 
                    fontSize: 10
                  },
                  grid: { stroke: colors.grey, strokeOpacity: 0.3 }
                }}
                tickFormat={(t) => {
                  const minutes = Math.floor(t / 60);
                  const seconds = (t % 60).toFixed(1);
                  return `${minutes}:${seconds.padStart(4, '0')}`;
                }}
                tickCount={6}
              />

              {/* Line for each driver */}
              {chartData.map(({ driver, color, lineStyle, data }) => {
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
                        strokeLinejoin: "round",
                        strokeDasharray: lineStyle === 'dashed' ? "5,5" : "0,0"
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
        </ScrollView>
        
        {/* Legend */}
        <View style={{ 
          flexDirection: 'row', 
          flexWrap: 'wrap', 
          justifyContent: 'center', 
          marginTop: 12, 
          gap: 8,
          paddingHorizontal: 10
        }}>
          {selectedDrivers.map(driverCode => {
            const team = getDriverTeam(driverCode, year);
            const lineStyle = getDriverLineStyle(driverCode, selectedDrivers, year);
            const teamAbbr = team.split(' ')[0]; // Get first word of team name
            
            return (
              <View key={driverCode} style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 4,
                backgroundColor: 'rgba(255,255,255,0.05)',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                marginBottom: 4
              }}>
                <View 
                  style={{
                    width: 16,
                    height: 2,
                    backgroundColor: getDriverColor(driverCode, year),
                    borderRadius: 1,
                    opacity: lineStyle === 'dashed' ? 0.8 : 1,
                    borderStyle: lineStyle === 'dashed' ? 'dashed' : 'solid',
                    borderWidth: lineStyle === 'dashed' ? 1 : 0,
                    borderColor: getDriverColor(driverCode, year),
                  }}
                />
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '500' }}>
                  {driverCode}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 9 }}>
                  ({teamAbbr})
                </Text>
                {lineStyle === 'dashed' && (
                  <Text style={{ color: colors.textSecondary, fontSize: 8 }}>
                    --
                  </Text>
                )}
              </View>
            );
          })}
        </View>
        
        {/* Chart info */}
        <Text style={{ 
          color: colors.textSecondary, 
          fontSize: 11, 
          textAlign: 'center', 
          marginTop: 8,
          fontStyle: 'italic' 
        }}>
          Scroll horizontally to view all laps • Lower times are better
        </Text>
      </View>
    );
  };

  const renderTable = () => {
    if (!lapData || lapData.length === 0) return null;

    return (
      <View style={{ marginVertical: 20 }}>
        {/* Table Header */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: colors.backgroundAlt,
          paddingVertical: 12,
          paddingHorizontal: 8,
          borderRadius: 8,
          marginBottom: 2,
        }}>
          <Text style={{ flex: 1, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
            Lap
          </Text>
          {selectedDrivers.map(driverCode => (
            <Text key={driverCode} style={{ 
              flex: 1, 
              color: getDriverColor(driverCode, year), 
              fontWeight: 'bold', 
              textAlign: 'center',
              fontSize: 12,
            }}>
              {driverCode}
            </Text>
          ))}
        </View>

        {/* Data Rows */}
        <ScrollView style={{ maxHeight: 300 }}>
          {lapData.slice(0, 20).map((lap, index) => (
            <View key={lap.LapNumber} style={{
              flexDirection: 'row',
              backgroundColor: index % 2 === 0 ? colors.card : colors.background,
              paddingVertical: 8,
              paddingHorizontal: 8,
              borderRadius: 4,
              marginBottom: 1,
            }}>
              <Text style={{ flex: 1, color: '#fff', textAlign: 'center', fontSize: 12 }}>
                {lap.LapNumber}
              </Text>
              {selectedDrivers.map(driverCode => {
                const lapTime = lap[driverCode] as number | null;
                return (
                  <Text key={driverCode} style={{ 
                    flex: 1, 
                    color: lapTime ? '#fff' : colors.textSecondary, 
                    textAlign: 'center',
                    fontSize: 11,
                  }}>
                    {lapTime ? formatLapTime(lapTime) : '-'}
                  </Text>
                );
              })}
            </View>
          ))}
        </ScrollView>

        {lapData.length > 20 && (
          <Text style={{ 
            color: colors.textSecondary, 
            fontSize: 12, 
            textAlign: 'center', 
            marginTop: 8 
          }}>
            Showing first 20 laps of {lapData.length}
          </Text>
        )}
        
        {/* Legend */}
        <View style={{ 
          flexDirection: 'row', 
          flexWrap: 'wrap', 
          justifyContent: 'center', 
          marginTop: 12, 
          gap: 8,
          paddingHorizontal: 10
        }}>
          {selectedDrivers.map(driverCode => {
            const team = getDriverTeam(driverCode, year);
            const lineStyle = getDriverLineStyle(driverCode, selectedDrivers, year);
            const teamAbbr = team.split(' ')[0]; // Get first word of team name
            
            return (
              <View key={driverCode} style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 4,
                backgroundColor: 'rgba(255,255,255,0.05)',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                marginBottom: 4
              }}>
                <View 
                  style={{
                    width: 16,
                    height: 2,
                    backgroundColor: getDriverColor(driverCode, year),
                    borderRadius: 1,
                    opacity: lineStyle === 'dashed' ? 0.8 : 1,
                    borderStyle: lineStyle === 'dashed' ? 'dashed' : 'solid',
                    borderWidth: lineStyle === 'dashed' ? 1 : 0,
                    borderColor: getDriverColor(driverCode, year),
                  }}
                />
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '500' }}>
                  {driverCode}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 9 }}>
                  ({teamAbbr})
                </Text>
                {lineStyle === 'dashed' && (
                  <Text style={{ color: colors.textSecondary, fontSize: 8 }}>
                    --
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderViewToggle = () => (
    <View style={{ 
      flexDirection: 'row', 
      backgroundColor: "#14141c",
      borderColor: "#212a39",
      borderWidth: 1,
      borderRadius: 8, 
      padding: 1.5, 
      marginHorizontal: 3,
      marginBottom: 16 
    }}>
      <TouchableOpacity
        style={{
          flex: 1,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 6,
          backgroundColor: viewMode === 'chart' ? colors.primary : 'transparent',
          alignItems: 'center',
        }}
        onPress={() => setViewMode('chart')}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <ChartLineIcon 
            size={14} 
            color={viewMode === 'chart' ? '#fff' : colors.textSecondary} 
          />
          <Text style={{ 
            color: viewMode === 'chart' ? '#fff' : colors.textSecondary, 
            fontWeight: viewMode === 'chart' ? 'bold' : 'normal',
            fontSize: 12 
          }}>
            Chart
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          flex: 1,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 6,
          backgroundColor: viewMode === 'table' ? colors.primary : 'transparent',
          alignItems: 'center',
        }}
        onPress={() => setViewMode('table')}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <MaterialCommunityIcons name="table-large" size={14} color="white" />
          <Text style={{ 
            color: viewMode === 'table' ? '#fff' : colors.textSecondary, 
            fontWeight: viewMode === 'table' ? 'bold' : 'normal',
            fontSize: 12 
          }}>
            Table
          </Text>
        </View>
      </TouchableOpacity>
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
            <Text style={{ color: '#fff' }}>Reset</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (isLoadingDrivers) {
      return (
        <View style={{ alignItems: 'center', padding: 40 }}>
          <LoadingSpinnerF1 size={48} color={colors.primary} />
          
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

    if (isLoadingLapTimes) {
      return (
        <View>
          {renderDriverSelector()}
          <View style={{ alignItems: 'center', padding: 40 }}>
            <LoadingSpinnerF1 size={48} color={colors.primary} />
            
          </View>
        </View>
      );
    }

    if (lapData.length === 0) {
      return (
        <View>
          {renderDriverSelector()}
          <View style={{ alignItems: 'center', padding: 20 }}>
            <Feather name="info" size={48} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontSize: 16, marginTop: 12 }}>
              No lap data available
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
              <Text style={{ color: '#fff' }}>Back to Selection</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View>
        {renderDriverSelector()}
        {renderViewToggle()}
        {viewMode === 'chart' ? renderChart() : renderTable()}
        
      </View>
    );
  };

  return (
    <View style={{ padding: 0, backgroundColor: "transparent" }}>
            <Text style={[commonStyles.title, { marginBottom: 16, textAlign: 'center', fontSize: 24 }]}>
              Lap Times Comparison
            </Text>
      <ScrollView style={{ flex: 1, padding: 0, backgroundColor: "transparent" }}>
        {renderContent()}
      </ScrollView>
      {renderDriverModal()}
    </View>
  );
};

export default LapTimesChart;
