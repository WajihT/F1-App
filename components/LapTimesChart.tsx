import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryLegend, VictoryContainer } from 'victory-native';
import { colors } from '../styles/commonStyles';
import { fetchLapTimes, fetchSessionDrivers } from '../lib/api';
import { LapTimeDataPoint, SessionDriver } from '../lib/types';
import Icon from './Icon';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';

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

  const renderDriverSelector = () => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
        Select Drivers ({selectedDrivers.length}/{MAX_DRIVERS})
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {availableDrivers.map(driver => {
            const isSelected = selectedDrivers.includes(driver.code);
            return (
              <TouchableOpacity
                key={driver.code}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: isSelected 
                    ? getDriverColor(driver.code, year) 
                    : colors.backgroundAlt,
                  borderWidth: 1,
                  borderColor: isSelected 
                    ? getDriverColor(driver.code, year) 
                    : colors.grey,
                  minWidth: 60,
                  alignItems: 'center',
                }}
                onPress={() => toggleDriverSelection(driver.code)}
                disabled={isLoadingDrivers}
              >
                <Text style={{
                  color: isSelected ? '#fff' : colors.textSecondary,
                  fontWeight: isSelected ? 'bold' : 'normal',
                  fontSize: 12,
                }}>
                  {driver.code}
                </Text>
                <Text style={{
                  color: isSelected ? '#fff' : colors.textSecondary,
                  fontSize: 10,
                  opacity: 0.8,
                }}>
                  {driver.name.split(' ').pop()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );

  const renderLoadButton = () => (
    <View style={{ alignItems: 'center', marginVertical: 20 }}>
      <TouchableOpacity
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
        onPress={() => setShouldLoadChart(true)}
        disabled={selectedDrivers.length < MIN_DRIVERS || isLoadingDrivers}
      >
        <MaterialIcons name="show-chart" size={20} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Load Chart</Text>
      </TouchableOpacity>
      <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 8, textAlign: 'center' }}>
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
              padding={{ left: 80, top: 20, right: 40, bottom: 60 }}
              domain={{ x: [minLap, maxLap], y: yDomain }}
              containerComponent={
                <VictoryContainer 
                  style={{ 
                    touchAction: "auto",
                    backgroundColor: colors.background 
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
      backgroundColor: colors.backgroundAlt, 
      borderRadius: 8, 
      padding: 4, 
      alignSelf: 'center',
      marginBottom: 16 
    }}>
      <TouchableOpacity
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 6,
          backgroundColor: viewMode === 'chart' ? colors.primary : 'transparent',
        }}
        onPress={() => setViewMode('chart')}
      >
        <Text style={{ 
          color: viewMode === 'chart' ? '#fff' : colors.textSecondary, 
          fontWeight: viewMode === 'chart' ? 'bold' : 'normal',
          fontSize: 12 
        }}>
          📈 Chart
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 6,
          backgroundColor: viewMode === 'table' ? colors.primary : 'transparent',
        }}
        onPress={() => setViewMode('table')}
      >
        <Text style={{ 
          color: viewMode === 'table' ? '#fff' : colors.textSecondary, 
          fontWeight: viewMode === 'table' ? 'bold' : 'normal',
          fontSize: 12 
        }}>
          📊 Table
        </Text>
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
            <Text style={{ color: '#fff' }}>Back to Selection</Text>
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

    if (isLoadingLapTimes) {
      return (
        <View>
          {renderDriverSelector()}
          <View style={{ alignItems: 'center', padding: 40 }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Loading lap times...</Text>
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
        <TouchableOpacity
          style={{
            backgroundColor: colors.backgroundAlt,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 6,
            alignSelf: 'center',
            marginTop: 12,
          }}
          onPress={() => setShouldLoadChart(false)}
        >
          <Text style={{ color: '#fff' }}>Back to Selection</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        Lap Time Comparison
      </Text>
      {renderContent()}
    </ScrollView>
  );
};

export default LapTimesChart;
