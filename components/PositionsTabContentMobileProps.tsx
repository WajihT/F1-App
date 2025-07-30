import React, { useState, useEffect } from 'react';
import { ScrollView, Text, StyleSheet, View, TouchableOpacity, Modal, FlatList, Dimensions, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryLegend, VictoryTooltip, VictoryVoronoiContainer, VictoryContainer, VictoryScatter } from 'victory-native';
import { fetchLapPositions } from '../lib/api';
import { LapPositionDataPoint } from '../lib/types';

export default function PositionsTabContentMobile({ 
  year = 2024, 
  event = "bahrain", 
  session = "Race",
  useMockData = false 
}: {
  year?: number;
  event?: string;
  session?: string;
  useMockData?: boolean;
}) {
const [selectedDrivers, setSelectedDrivers] = useState<string[]>([
  'RUS', 'ANT', 'VER', 'TSU', 'HAM', 'LEC', 'NOR', 'PIA',
  'ALO', 'STR', 'GAS', 'COL', 'ALB', 'SAI', 'BEA', 'OCO',
  'LAW', 'HAD', 'HUL', 'BOR'
]);

const [isModalVisible, setIsModalVisible] = useState(false);
const [realData, setRealData] = useState<LapPositionDataPoint[] | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [activeTooltip, setActiveTooltip] = useState<{
  lap: number;
  positions: { driver: string; position: number; color: string }[];
} | null>(null);
const [clickedLap, setClickedLap] = useState<number | null>(null);

// All 20 F1 drivers with team assignments (based on your color mapping)
const driverCodes = [
  'RUS', 'ANT', 'VER', 'TSU', 'HAM', 'LEC', 'NOR', 'PIA',
  'ALO', 'STR', 'GAS', 'COL', 'ALB', 'SAI', 'BEA', 'OCO',
  'LAW', 'HAD', 'HUL', 'BOR'
];
  
  // Team assignments - first driver is main, second is secondary
const teamDrivers = {
  'Mercedes': ['RUS', 'ANT'],
  'Red Bull': ['VER', 'TSU'],
  'Ferrari': ['HAM', 'LEC'],
  'McLaren': ['NOR', 'PIA'],
  'Aston Martin': ['ALO', 'STR'],
  'Alpine': ['GAS', 'COL'],
  'Williams': ['ALB', 'SAI'],
  'Haas': ['BEA', 'OCO'],
  'RB': ['LAW', 'HAD'],
  'Kick Sauber': ['HUL', 'BOR']
};

  // Check if driver is main driver (first in team)
  const isMainDriver = (code: string): boolean => {
    return Object.values(teamDrivers).some(team => team[0] === code);
  };
  
  // Mock driver colors based on team colors
  const driverColor = (code: string): string => {
    const colors: { [key: string]: string } = {
      'RUS': '#00D2BE', 'ANT': '#00D2BE', // Mercedes
      'VER': '#0600EF', 'TSU': '#0600EF', // Red Bull
      'HAM': '#DC143C', 'LEC': '#DC143C', // Ferrari
      'NOR': '#FF8700', 'PIA': '#FF8700', // McLaren
      'ALO': '#006F62', 'STR': '#006F62', // Aston Martin
      'GAS': '#0090FF', 'COL': '#0090FF', // Alpine
      'ALB': '#005AFF', 'SAI': '#005AFF', // Williams
      'BEA': '#FFFFFF', 'OCO': '#FFFFFF', // Haas
      'LAW': '#6692FF', 'HAD': '#6692FF', // RB
      'HUL': '#52E252', 'BOR': '#52E252', // Kick Sauber
    };
    return colors[code] || '#ef4444';
  };
  const chartLines = [
    // Mercedes
    {
      code: 'HAM',
      data: [
        { x: 1, y: 3 }, { x: 2, y: 2 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 2 },
        { x: 6, y: 1 }, { x: 7, y: 1 }, { x: 8, y: 3 }, { x: 9, y: 2 }, { x: 10, y: 1 },
        { x: 11, y: 2 }, { x: 12, y: 1 }, { x: 13, y: 1 }, { x: 14, y: 3 }, { x: 15, y: 2 },
        { x: 16, y: 1 }, { x: 17, y: 2 }, { x: 18, y: 1 }, { x: 19, y: 1 }, { x: 20, y: 1 },
      ],
    },
    {
      code: 'RUS',
      data: [
        { x: 1, y: 4 }, { x: 2, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 3 }, { x: 5, y: 3 },
        { x: 6, y: 4 }, { x: 7, y: 5 }, { x: 8, y: 4 }, { x: 9, y: 4 }, { x: 10, y: 5 },
        { x: 11, y: 3 }, { x: 12, y: 4 }, { x: 13, y: 3 }, { x: 14, y: 4 }, { x: 15, y: 3 },
        { x: 16, y: 4 }, { x: 17, y: 3 }, { x: 18, y: 4 }, { x: 19, y: 3 }, { x: 20, y: 3 },
      ],
    },
    // Red Bull
    {
      code: 'VER',
      data: [
        { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 1 },
        { x: 6, y: 2 }, { x: 7, y: 2 }, { x: 8, y: 1 }, { x: 9, y: 1 }, { x: 10, y: 2 },
        { x: 11, y: 1 }, { x: 12, y: 2 }, { x: 13, y: 2 }, { x: 14, y: 1 }, { x: 15, y: 1 },
        { x: 16, y: 2 }, { x: 17, y: 1 }, { x: 18, y: 2 }, { x: 19, y: 2 }, { x: 20, y: 2 },
      ],
    },
    {
      code: 'PER',
      data: [
        { x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 3 }, { x: 4, y: 4 }, { x: 5, y: 4 },
        { x: 6, y: 3 }, { x: 7, y: 3 }, { x: 8, y: 2 }, { x: 9, y: 3 }, { x: 10, y: 3 },
        { x: 11, y: 4 }, { x: 12, y: 3 }, { x: 13, y: 4 }, { x: 14, y: 2 }, { x: 15, y: 4 },
        { x: 16, y: 3 }, { x: 17, y: 4 }, { x: 18, y: 3 }, { x: 19, y: 4 }, { x: 20, y: 4 },
      ],
    },
    // Ferrari
    {
      code: 'LEC',
      data: [
        { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 },
        { x: 6, y: 5 }, { x: 7, y: 4 }, { x: 8, y: 5 }, { x: 9, y: 5 }, { x: 10, y: 4 },
        { x: 11, y: 5 }, { x: 12, y: 5 }, { x: 13, y: 5 }, { x: 14, y: 5 }, { x: 15, y: 5 },
        { x: 16, y: 5 }, { x: 17, y: 5 }, { x: 18, y: 5 }, { x: 19, y: 5 }, { x: 20, y: 5 },
      ],
    },
    {
      code: 'SAI',
      data: [
        { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
        { x: 6, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 6 }, { x: 9, y: 6 }, { x: 10, y: 6 },
        { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 }, { x: 14, y: 6 }, { x: 15, y: 6 },
        { x: 16, y: 6 }, { x: 17, y: 6 }, { x: 18, y: 6 }, { x: 19, y: 6 }, { x: 20, y: 6 },
      ],
    },
    // McLaren
    {
      code: 'NOR',
      data: [
        { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 },
        { x: 6, y: 8 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 8 }, { x: 10, y: 7 },
        { x: 11, y: 7 }, { x: 12, y: 8 }, { x: 13, y: 7 }, { x: 14, y: 7 }, { x: 15, y: 8 },
        { x: 16, y: 7 }, { x: 17, y: 7 }, { x: 18, y: 7 }, { x: 19, y: 7 }, { x: 20, y: 7 },
      ],
    },
    {
      code: 'PIA',
      data: [
        { x: 1, y: 8 }, { x: 2, y: 8 }, { x: 3, y: 8 }, { x: 4, y: 8 }, { x: 5, y: 8 },
        { x: 6, y: 7 }, { x: 7, y: 8 }, { x: 8, y: 8 }, { x: 9, y: 7 }, { x: 10, y: 8 },
        { x: 11, y: 8 }, { x: 12, y: 7 }, { x: 13, y: 8 }, { x: 14, y: 8 }, { x: 15, y: 7 },
        { x: 16, y: 8 }, { x: 17, y: 8 }, { x: 18, y: 8 }, { x: 19, y: 8 }, { x: 20, y: 8 },
      ],
    },
    // Aston Martin
    {
      code: 'ALO',
      data: [
        { x: 1, y: 9 }, { x: 2, y: 9 }, { x: 3, y: 9 }, { x: 4, y: 9 }, { x: 5, y: 9 },
        { x: 6, y: 9 }, { x: 7, y: 9 }, { x: 8, y: 9 }, { x: 9, y: 9 }, { x: 10, y: 9 },
        { x: 11, y: 9 }, { x: 12, y: 9 }, { x: 13, y: 9 }, { x: 14, y: 9 }, { x: 15, y: 9 },
        { x: 16, y: 9 }, { x: 17, y: 10 }, { x: 18, y: 9 }, { x: 19, y: 9 }, { x: 20, y: 9 },
      ],
    },
    {
      code: 'STR',
      data: [
        { x: 1, y: 10 }, { x: 2, y: 10 }, { x: 3, y: 10 }, { x: 4, y: 10 }, { x: 5, y: 10 },
        { x: 6, y: 10 }, { x: 7, y: 10 }, { x: 8, y: 10 }, { x: 9, y: 10 }, { x: 10, y: 10 },
        { x: 11, y: 10 }, { x: 12, y: 10 }, { x: 13, y: 10 }, { x: 14, y: 10 }, { x: 15, y: 10 },
        { x: 16, y: 10 }, { x: 17, y: 9 }, { x: 18, y: 10 }, { x: 19, y: 10 }, { x: 20, y: 10 },
      ],
    },
    // Alpine
    {
      code: 'GAS',
      data: [
        { x: 1, y: 11 }, { x: 2, y: 11 }, { x: 3, y: 11 }, { x: 4, y: 11 }, { x: 5, y: 12 },
        { x: 6, y: 11 }, { x: 7, y: 11 }, { x: 8, y: 12 }, { x: 9, y: 11 }, { x: 10, y: 11 },
        { x: 11, y: 12 }, { x: 12, y: 11 }, { x: 13, y: 11 }, { x: 14, y: 12 }, { x: 15, y: 11 },
        { x: 16, y: 11 }, { x: 17, y: 11 }, { x: 18, y: 11 }, { x: 19, y: 11 }, { x: 20, y: 11 },
      ],
    },
    {
      code: 'OCO',
      data: [
        { x: 1, y: 12 }, { x: 2, y: 12 }, { x: 3, y: 12 }, { x: 4, y: 12 }, { x: 5, y: 11 },
        { x: 6, y: 12 }, { x: 7, y: 12 }, { x: 8, y: 11 }, { x: 9, y: 12 }, { x: 10, y: 12 },
        { x: 11, y: 11 }, { x: 12, y: 12 }, { x: 13, y: 12 }, { x: 14, y: 11 }, { x: 15, y: 12 },
        { x: 16, y: 12 }, { x: 17, y: 12 }, { x: 18, y: 12 }, { x: 19, y: 12 }, { x: 20, y: 12 },
      ],
    },
    // Williams
    {
      code: 'ALB',
      data: [
        { x: 1, y: 13 }, { x: 2, y: 13 }, { x: 3, y: 13 }, { x: 4, y: 13 }, { x: 5, y: 13 },
        { x: 6, y: 13 }, { x: 7, y: 13 }, { x: 8, y: 13 }, { x: 9, y: 13 }, { x: 10, y: 13 },
        { x: 11, y: 13 }, { x: 12, y: 13 }, { x: 13, y: 14 }, { x: 14, y: 13 }, { x: 15, y: 13 },
        { x: 16, y: 14 }, { x: 17, y: 13 }, { x: 18, y: 13 }, { x: 19, y: 13 }, { x: 20, y: 13 },
      ],
    },
    {
      code: 'SAR',
      data: [
        { x: 1, y: 14 }, { x: 2, y: 14 }, { x: 3, y: 14 }, { x: 4, y: 14 }, { x: 5, y: 14 },
        { x: 6, y: 14 }, { x: 7, y: 14 }, { x: 8, y: 14 }, { x: 9, y: 14 }, { x: 10, y: 14 },
        { x: 11, y: 14 }, { x: 12, y: 14 }, { x: 13, y: 13 }, { x: 14, y: 14 }, { x: 15, y: 14 },
        { x: 16, y: 13 }, { x: 17, y: 14 }, { x: 18, y: 14 }, { x: 19, y: 14 }, { x: 20, y: 14 },
      ],
    },
    // Haas
    {
      code: 'MAG',
      data: [
        { x: 1, y: 15 }, { x: 2, y: 15 }, { x: 3, y: 15 }, { x: 4, y: 15 }, { x: 5, y: 15 },
        { x: 6, y: 15 }, { x: 7, y: 15 }, { x: 8, y: 15 }, { x: 9, y: 15 }, { x: 10, y: 15 },
        { x: 11, y: 15 }, { x: 12, y: 15 }, { x: 13, y: 15 }, { x: 14, y: 15 }, { x: 15, y: 15 },
        { x: 16, y: 15 }, { x: 17, y: 16 }, { x: 18, y: 15 }, { x: 19, y: 15 }, { x: 20, y: 15 },
      ],
    },
    {
      code: 'HUL',
      data: [
        { x: 1, y: 16 }, { x: 2, y: 16 }, { x: 3, y: 16 }, { x: 4, y: 16 }, { x: 5, y: 16 },
        { x: 6, y: 16 }, { x: 7, y: 16 }, { x: 8, y: 16 }, { x: 9, y: 16 }, { x: 10, y: 16 },
        { x: 11, y: 16 }, { x: 12, y: 16 }, { x: 13, y: 16 }, { x: 14, y: 16 }, { x: 15, y: 16 },
        { x: 16, y: 16 }, { x: 17, y: 15 }, { x: 18, y: 16 }, { x: 19, y: 16 }, { x: 20, y: 16 },
      ],
    },
    // RB
    {
      code: 'TSU',
      data: [
        { x: 1, y: 17 }, { x: 2, y: 17 }, { x: 3, y: 17 }, { x: 4, y: 17 }, { x: 5, y: 17 },
        { x: 6, y: 17 }, { x: 7, y: 17 }, { x: 8, y: 18 }, { x: 9, y: 17 }, { x: 10, y: 17 },
        { x: 11, y: 17 }, { x: 12, y: 17 }, { x: 13, y: 17 }, { x: 14, y: 18 }, { x: 15, y: 17 },
        { x: 16, y: 17 }, { x: 17, y: 17 }, { x: 18, y: 17 }, { x: 19, y: 18 }, { x: 20, y: 17 },
      ],
    },
    {
      code: 'RIC',
      data: [
        { x: 1, y: 18 }, { x: 2, y: 18 }, { x: 3, y: 18 }, { x: 4, y: 18 }, { x: 5, y: 18 },
        { x: 6, y: 18 }, { x: 7, y: 18 }, { x: 8, y: 17 }, { x: 9, y: 18 }, { x: 10, y: 18 },
        { x: 11, y: 18 }, { x: 12, y: 18 }, { x: 13, y: 18 }, { x: 14, y: 17 }, { x: 15, y: 18 },
        { x: 16, y: 18 }, { x: 17, y: 18 }, { x: 18, y: 18 }, { x: 19, y: 17 }, { x: 20, y: 18 },
      ],
    },
    // Kick Sauber
    {
      code: 'BOT',
      data: [
        { x: 1, y: 19 }, { x: 2, y: 19 }, { x: 3, y: 19 }, { x: 4, y: 19 }, { x: 5, y: 19 },
        { x: 6, y: 19 }, { x: 7, y: 20 }, { x: 8, y: 19 }, { x: 9, y: 19 }, { x: 10, y: 20 },
        { x: 11, y: 19 }, { x: 12, y: 19 }, { x: 13, y: 19 }, { x: 14, y: 20 }, { x: 15, y: 19 },
        { x: 16, y: 19 }, { x: 17, y: 19 }, { x: 18, y: 19 }, { x: 19, y: 19 }, { x: 20, y: 19 },
      ],
    },
    {
      code: 'ZHO',
      data: [
        { x: 1, y: 20 }, { x: 2, y: 20 }, { x: 3, y: 20 }, { x: 4, y: 20 }, { x: 5, y: 20 },
        { x: 6, y: 20 }, { x: 7, y: 19 }, { x: 8, y: 20 }, { x: 9, y: 20 }, { x: 10, y: 19 },
        { x: 11, y: 20 }, { x: 12, y: 20 }, { x: 13, y: 20 }, { x: 14, y: 19 }, { x: 15, y: 20 },
        { x: 16, y: 20 }, { x: 17, y: 20 }, { x: 18, y: 20 }, { x: 19, y: 20 }, { x: 20, y: 20 },
      ],
    },
  ];

  const handleDriverSelectionChange = (driverCode: string) => {
    setSelectedDrivers(prev => 
      prev.includes(driverCode)
        ? prev.filter(code => code !== driverCode)
        : [...prev, driverCode]
    );
  };

  const handleSelectAll = () => {
    setSelectedDrivers([...driverCodes]);
  };

  const handleSelectNone = () => {
    setSelectedDrivers([]);
  };

  // Fetch real data when not using mock data
  useEffect(() => {
    if (!useMockData) {
      const loadPositionData = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await fetchLapPositions(year, event, session);
          //console.log("Live DATA:",data);
          setRealData(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load position data');
        } finally {
          setLoading(false);
        }
      };
      loadPositionData();
    }
  }, [year, event, session, useMockData]);

  // Convert real data to chart format
  const convertRealDataToChartLines = (data: LapPositionDataPoint[]) => {
    const driverCodes = Object.keys(data[0] || {}).filter(key => key !== 'LapNumber');
    return driverCodes.map(code => ({
      code,
      data: data.map(lap => ({
        x: lap.LapNumber,
        y: lap[code] || 20 // Default to last position if null
      }))
    }));
  };

  const filteredChartLines = useMockData 
    ? chartLines.filter(line => selectedDrivers.includes(line.code))
    : realData 
      ? convertRealDataToChartLines(realData).filter(line => selectedDrivers.includes(line.code))
      : [];
  
  const maxLap = Math.max(...(filteredChartLines.length > 0 ? filteredChartLines.flatMap(line => line.data.map(d => d.x)) : [20]));
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(screenWidth - 40, maxLap * 25); // Minimum width based on laps
  const flipY = (y: number) => 21 - y;

  const getButtonText = () => {
    if (selectedDrivers.length === driverCodes.length) return "All Drivers";
    if (selectedDrivers.length === 0) return "Select Drivers...";
    return `${selectedDrivers.length} Selected`;
  };

  const CustomTooltipLabel = ({ datum }: any) => {
  return `Lap ${datum.x}\n${datum.seriesName} : P${21 - datum.y}`;
};

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Lap-by-Lap Position Changes</Text>
      
      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loadingText}>Loading position data...</Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              if (!useMockData) {
                const loadPositionData = async () => {
                  setLoading(true);
                  setError(null);
                  try {
                    const data = await fetchLapPositions(year, event, session);
                    setRealData(data);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to load position data');
                  } finally {
                    setLoading(false);
                  }
                };
                loadPositionData();
              }
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Chart Content */}
      {!loading && !error && (
        <>
          {/* Driver Selection Button */}
          <TouchableOpacity 
            style={styles.driverSelectorButton}
            onPress={() => setIsModalVisible(true)}
            disabled={driverCodes.length === 0}
          >
            <Text style={styles.driverSelectorButtonText}>
              {getButtonText()}
            </Text>
            <Text style={styles.chevron}>▾</Text>
          </TouchableOpacity>

      {/* Driver Selection Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Drivers</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={handleSelectAll} style={styles.actionButton}>
                <Text style={styles.actionButtonText}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSelectNone} style={styles.actionButton}>
                <Text style={styles.actionButtonText}>None</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={driverCodes}
              style={styles.driverList}
              keyExtractor={(item) => item}
              renderItem={({ item: driverCode }) => (
                <TouchableOpacity
                  style={styles.driverItem}
                  onPress={() => handleDriverSelectionChange(driverCode)}
                >
                  <View style={[
                    styles.checkbox,
                    selectedDrivers.includes(driverCode) && styles.checkboxSelected
                  ]}>
                    {selectedDrivers.includes(driverCode) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <Text style={[styles.driverCode, { color: driverColor(driverCode) }]}>
                    {driverCode}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Horizontally Scrollable Chart Container */}
      <View style={{ position: 'relative' }}>
        <ScrollView 
          horizontal={true}
          showsHorizontalScrollIndicator={true}
          style={styles.chartContainer}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          <TouchableWithoutFeedback onPress={() => {
            setActiveTooltip(null);
            setClickedLap(null);
          }}>
            <View style={{ width: chartWidth, height: 280 }}>

<VictoryChart
  width={chartWidth}
  height={280}
  padding={{ left: 30, right: 20, top: 20, bottom: 50 }}
  domainPadding={{ x: 15, y: 5 }}
  containerComponent={
    <VictoryVoronoiContainer
      voronoiDimension="x"
      onActivated={(points, props) => {
        if (points && points.length > 0) {
          const datum = points[0];
          const lap = Math.round(datum.x);
          
          // Get all driver positions for this lap
          const positions = filteredChartLines.map(line => {
            const dataPoint = line.data.find(point => point.x === lap);
            return {
              driver: line.code,
              position: dataPoint ? dataPoint.y : 20,
              color: driverColor(line.code)
            };
          }).sort((a, b) => a.position - b.position); // Sort by position
          
          setActiveTooltip({
            lap: lap,
            positions: positions
          });
          setClickedLap(lap);
        }
      }}
      onDeactivated={() => {
        // Keep tooltip visible when deactivated - only close manually
      }}
      labels={() => ''} // Return empty string so no default label shows
    />
  }
>

          <VictoryAxis
            style={{
              axis: { stroke: '#374151' },
              tickLabels: { fill: '#9ca3af', fontSize: 8 },
              grid: { stroke: '#374151', strokeDasharray: '2,2' }
            }}
            tickCount={maxLap}
            tickFormat={(t) => `${Math.round(t)}`}
          />
          <VictoryAxis
            dependentAxis
            domain={[20, 1]}
            tickCount={20}
            tickFormat={(t) => `P${21 - t}`}
            style={{
              axis: { stroke: '#374151' },
              tickLabels: { fill: '#9ca3af', fontSize: 8 },
              grid: { stroke: '#374151', strokeDasharray: '2,2' }
            }}
          />
          {filteredChartLines.map(line => {
  const flippedData = line.data.map(point => ({
    ...point,
    y: flipY(point.y),
  }));
  return (
    <VictoryLine
      key={line.code}
      name={line.code}
      data={flippedData}
      style={{
        data: { 
          stroke: driverColor(line.code), 
          strokeWidth: 2.5,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeDasharray: isMainDriver(line.code) ? '0' : '5,5'
        },
      }}
      animate={{
        duration: 1000,
        onLoad: { duration: 500 }
      }}
    />
  );
})}

          {/* Dots for clicked lap */}
          {clickedLap && filteredChartLines.map(line => {
            const dataPoint = line.data.find(point => point.x === clickedLap);
            if (!dataPoint) return null;
            
            const flippedPoint = {
              x: dataPoint.x,
              y: flipY(dataPoint.y)
            };
            
            return (
              <VictoryScatter
                key={`${line.code}-dot`}
                data={[flippedPoint]}
                size={6}
                style={{
                  data: { 
                    fill: driverColor(line.code),
                    stroke: '#fff',
                    strokeWidth: 2
                  },
                }}
              />
            );
          })}
        </VictoryChart>

        {/* Custom Persistent Tooltip */}
        {activeTooltip && (
          <View
            style={[
              styles.customTooltip,
              {
                position: 'absolute',
                left: Math.max(10, Math.min((activeTooltip.lap - 1) * (chartWidth / maxLap) + 50, chartWidth - 130)),
                top: 4,
                bottom: 0, // Extend to full height to show all drivers
                zIndex: 10000,
              }
            ]}
          >
            <View style={styles.tooltipHeader}>
              <Text style={styles.tooltipTitle}>
                Lap {activeTooltip.lap}
              </Text>
              <TouchableOpacity 
                style={styles.tooltipCloseButton}
                onPress={() => {
                  setActiveTooltip(null);
                  setClickedLap(null);
                }}
              >
                <Text style={styles.tooltipCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.tooltipDriversList} showsVerticalScrollIndicator={false}>
              {activeTooltip.positions.map((pos, index) => (
                <View key={pos.driver} style={styles.tooltipDriverItem}>
                  <Text style={[styles.tooltipDriverCode, { color: pos.color }]}>
                    {pos.driver}
                  </Text>
                  <Text style={styles.tooltipPosition}>
                    P{pos.position}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        </View>
        </TouchableWithoutFeedback>
      </ScrollView>
      </View>

      {/* Fixed Multi-Row Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendGrid}>
          {selectedDrivers.map(code => (
            <View key={code} style={styles.legendItem}>
              <View style={styles.legendLineContainer}>
                {isMainDriver(code) ? (
                  // Solid line for main drivers
                  <View style={[styles.legendLine, { backgroundColor: driverColor(code) }]} />
                ) : (
                  // Dashed line for secondary drivers
                  <View style={styles.legendDashedContainer}>
                    <View style={[styles.legendDash, { backgroundColor: driverColor(code) }]} />
                    <View style={[styles.legendDash, { backgroundColor: driverColor(code) }]} />
                    <View style={[styles.legendDash, { backgroundColor: driverColor(code) }]} />
                  </View>
                )}
              </View>
              <Text style={[styles.legendText, { color: driverColor(code) }]}>{code}</Text>
            </View>
          ))}
        </View>
      </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 16,
    margin: 8,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  driverSelectorButton: {
    backgroundColor: '#374151',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4b5563',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 180,
  },
  driverSelectorButtonText: {
    color: '#fff',
    fontSize: 12,
    flex: 1,
  },
  chevron: {
    color: '#9ca3af',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    width: '80%',
    maxHeight: '70%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    color: '#9ca3af',
    fontSize: 18,
    padding: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    paddingBottom: 12,
    marginBottom: 12,
  },
  actionButton: {
    padding: 8,
  },
  actionButtonText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  driverList: {
    maxHeight: 250,
  },
  driverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#4b5563',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  checkmark: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  driverCode: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartContainer: {
    marginVertical: 8,
  },
  legendContainer: {
    marginTop: 12,
    paddingHorizontal: 8,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '18%', // 5 items per row with some spacing
    minWidth: 50,
  },
  legendLineContainer: {
    width: 16,
    height: 2,
    marginRight: 6,
    position: 'relative',
  },
  legendLine: {
    width: '100%',
    height: 2,
  },
  legendDashedContainer: {
    width: '100%',
    height: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendDash: {
    width: 4,
    height: 2,
  },
  legendLineDashed: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 2,
    opacity: 0.6,
  },
  legendText: {
    fontSize: 9,
    fontWeight: '600',
    flex: 1,
  },
  // Loading and Error States
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 10,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Custom Tooltip Styles
  customTooltip: {
    backgroundColor: 'rgba(18, 24, 37, 0.95)', // #121825 with 95% opacity for slight transparency
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    width: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    display: 'flex',
    flexDirection: 'column',
  },
  tooltipTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginBottom: 2,
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tooltipCloseButton: {
    padding: 2,
    marginLeft: 4,
  },
  tooltipCloseText: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tooltipDriversList: {
    paddingVertical: 2,
    flex: 1, // Allow it to take remaining space
  },
  tooltipDriverItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  tooltipDriverCode: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  tooltipPosition: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    minWidth: 24,
    textAlign: 'right',
  },
  tooltipText: {
    color: '#f1f5f9',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});