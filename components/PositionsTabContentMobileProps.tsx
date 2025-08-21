import React, { useState, useEffect } from 'react';
import { ScrollView, Text, StyleSheet, View, TouchableOpacity, Modal, FlatList, Dimensions } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryContainer } from 'victory-native';
import { MaterialIcons } from '@expo/vector-icons';
import { fetchLapPositions } from '../lib/api';
import { LapPositionDataPoint } from '../lib/types';
import { commonStyles, colors, typography } from '../styles/commonStyles';
import LoadingSpinnerF1 from './LoadingSpinnerF1';

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
const [shouldLoadChart, setShouldLoadChart] = useState(false);
const [isChartRendering, setIsChartRendering] = useState(false);
const [renderedLines, setRenderedLines] = useState<string[]>([]);

// Reduced driver list for better performance
const driverCodes = [
  'RUS', 'ANT', 'VER', 'TSU', 'HAM', 'LEC', 'NOR', 'PIA',
  'ALO', 'STR', 'GAS', 'COL', 'ALB', 'SAI', 'BEA', 'OCO',
  'LAW', 'HAD', 'HUL', 'BOR'
];

const MAX_DRIVERS = 20;
  
  // Team assignments - updated for better performance
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
  
  // Updated driver colors
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
      code: 'RUS',
      data: [
        { x: 1, y: 3 }, { x: 2, y: 2 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 2 },
        { x: 6, y: 1 }, { x: 7, y: 1 }, { x: 8, y: 3 }, { x: 9, y: 2 }, { x: 10, y: 1 },
        { x: 11, y: 2 }, { x: 12, y: 1 }, { x: 13, y: 1 }, { x: 14, y: 3 }, { x: 15, y: 2 },
        { x: 16, y: 1 }, { x: 17, y: 2 }, { x: 18, y: 1 }, { x: 19, y: 1 }, { x: 20, y: 1 },
      ],
    },
    {
      code: 'ANT',
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
      code: 'TSU',
      data: [
        { x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 3 }, { x: 4, y: 4 }, { x: 5, y: 4 },
        { x: 6, y: 3 }, { x: 7, y: 3 }, { x: 8, y: 2 }, { x: 9, y: 3 }, { x: 10, y: 3 },
        { x: 11, y: 4 }, { x: 12, y: 3 }, { x: 13, y: 4 }, { x: 14, y: 2 }, { x: 15, y: 4 },
        { x: 16, y: 3 }, { x: 17, y: 4 }, { x: 18, y: 3 }, { x: 19, y: 4 }, { x: 20, y: 4 },
      ],
    },
    // Ferrari
    {
      code: 'HAM',
      data: [
        { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 },
        { x: 6, y: 5 }, { x: 7, y: 4 }, { x: 8, y: 5 }, { x: 9, y: 5 }, { x: 10, y: 4 },
        { x: 11, y: 5 }, { x: 12, y: 5 }, { x: 13, y: 5 }, { x: 14, y: 5 }, { x: 15, y: 5 },
        { x: 16, y: 5 }, { x: 17, y: 5 }, { x: 18, y: 5 }, { x: 19, y: 5 }, { x: 20, y: 5 },
      ],
    },
    {
      code: 'LEC',
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
      code: 'COL',
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
      code: 'SAI',
      data: [
        { x: 1, y: 14 }, { x: 2, y: 14 }, { x: 3, y: 14 }, { x: 4, y: 14 }, { x: 5, y: 14 },
        { x: 6, y: 14 }, { x: 7, y: 14 }, { x: 8, y: 14 }, { x: 9, y: 14 }, { x: 10, y: 14 },
        { x: 11, y: 14 }, { x: 12, y: 14 }, { x: 13, y: 13 }, { x: 14, y: 14 }, { x: 15, y: 14 },
        { x: 16, y: 13 }, { x: 17, y: 14 }, { x: 18, y: 14 }, { x: 19, y: 14 }, { x: 20, y: 14 },
      ],
    },
    // Haas
    {
      code: 'BEA',
      data: [
        { x: 1, y: 15 }, { x: 2, y: 15 }, { x: 3, y: 15 }, { x: 4, y: 15 }, { x: 5, y: 15 },
        { x: 6, y: 15 }, { x: 7, y: 15 }, { x: 8, y: 15 }, { x: 9, y: 15 }, { x: 10, y: 15 },
        { x: 11, y: 15 }, { x: 12, y: 15 }, { x: 13, y: 15 }, { x: 14, y: 15 }, { x: 15, y: 15 },
        { x: 16, y: 15 }, { x: 17, y: 16 }, { x: 18, y: 15 }, { x: 19, y: 15 }, { x: 20, y: 15 },
      ],
    },
    {
      code: 'OCO',
      data: [
        { x: 1, y: 16 }, { x: 2, y: 16 }, { x: 3, y: 16 }, { x: 4, y: 16 }, { x: 5, y: 16 },
        { x: 6, y: 16 }, { x: 7, y: 16 }, { x: 8, y: 16 }, { x: 9, y: 16 }, { x: 10, y: 16 },
        { x: 11, y: 16 }, { x: 12, y: 16 }, { x: 13, y: 16 }, { x: 14, y: 16 }, { x: 15, y: 16 },
        { x: 16, y: 16 }, { x: 17, y: 15 }, { x: 18, y: 16 }, { x: 19, y: 16 }, { x: 20, y: 16 },
      ],
    },
    // RB
    {
      code: 'LAW',
      data: [
        { x: 1, y: 17 }, { x: 2, y: 17 }, { x: 3, y: 17 }, { x: 4, y: 17 }, { x: 5, y: 17 },
        { x: 6, y: 17 }, { x: 7, y: 17 }, { x: 8, y: 18 }, { x: 9, y: 17 }, { x: 10, y: 17 },
        { x: 11, y: 17 }, { x: 12, y: 17 }, { x: 13, y: 17 }, { x: 14, y: 18 }, { x: 15, y: 17 },
        { x: 16, y: 17 }, { x: 17, y: 17 }, { x: 18, y: 17 }, { x: 19, y: 18 }, { x: 20, y: 17 },
      ],
    },
    {
      code: 'HAD',
      data: [
        { x: 1, y: 18 }, { x: 2, y: 18 }, { x: 3, y: 18 }, { x: 4, y: 18 }, { x: 5, y: 18 },
        { x: 6, y: 18 }, { x: 7, y: 18 }, { x: 8, y: 17 }, { x: 9, y: 18 }, { x: 10, y: 18 },
        { x: 11, y: 18 }, { x: 12, y: 18 }, { x: 13, y: 18 }, { x: 14, y: 17 }, { x: 15, y: 18 },
        { x: 16, y: 18 }, { x: 17, y: 18 }, { x: 18, y: 18 }, { x: 19, y: 17 }, { x: 20, y: 18 },
      ],
    },
    // Kick Sauber
    {
      code: 'HUL',
      data: [
        { x: 1, y: 19 }, { x: 2, y: 19 }, { x: 3, y: 19 }, { x: 4, y: 19 }, { x: 5, y: 19 },
        { x: 6, y: 19 }, { x: 7, y: 20 }, { x: 8, y: 19 }, { x: 9, y: 19 }, { x: 10, y: 20 },
        { x: 11, y: 19 }, { x: 12, y: 19 }, { x: 13, y: 19 }, { x: 14, y: 20 }, { x: 15, y: 19 },
        { x: 16, y: 19 }, { x: 17, y: 19 }, { x: 18, y: 19 }, { x: 19, y: 19 }, { x: 20, y: 19 },
      ],
    },
    {
      code: 'BOR',
      data: [
        { x: 1, y: 20 }, { x: 2, y: 20 }, { x: 3, y: 20 }, { x: 4, y: 20 }, { x: 5, y: 20 },
        { x: 6, y: 20 }, { x: 7, y: 19 }, { x: 8, y: 20 }, { x: 9, y: 20 }, { x: 10, y: 19 },
        { x: 11, y: 20 }, { x: 12, y: 20 }, { x: 13, y: 20 }, { x: 14, y: 19 }, { x: 15, y: 20 },
        { x: 16, y: 20 }, { x: 17, y: 20 }, { x: 18, y: 20 }, { x: 19, y: 20 }, { x: 20, y: 20 },
      ],
    },
  ];

  const handleDriverSelectionChange = (driverCode: string) => {
    setSelectedDrivers(prev => {
      const isSelected = prev.includes(driverCode);
      let newSelection: string[];

      if (isSelected) {
        newSelection = prev.filter(code => code !== driverCode);
      } else {
        if (prev.length < MAX_DRIVERS) {
          newSelection = [...prev, driverCode];
        } else {
          // If at max, replace the last one
          newSelection = [...prev.slice(0, -1), driverCode];
        }
      }

      // Reset chart loading state when selection changes
      setShouldLoadChart(false);
      setIsChartRendering(false);
      setRenderedLines([]);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    setSelectedDrivers(driverCodes.slice(0, MAX_DRIVERS));
    setShouldLoadChart(false);
    setIsChartRendering(false);
    setRenderedLines([]);
  };

  const handleSelectNone = () => {
    setSelectedDrivers([]);
    setShouldLoadChart(false);
    setIsChartRendering(false);
    setRenderedLines([]);
  };

  // Load data when requested
  const loadPositionData = async () => {
    if (useMockData) {
      setIsChartRendering(true);
      setRenderedLines([]);
      
      // Start progressive line rendering
      setTimeout(() => {
        renderLinesProgressively(selectedDrivers);
      }, 100);
      
      setShouldLoadChart(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchLapPositions(year, event, session);
      setRealData(data);
      setIsChartRendering(true);
      setRenderedLines([]);
      
      // Start progressive line rendering
      setTimeout(() => {
        renderLinesProgressively(selectedDrivers);
      }, 100);
      
      setShouldLoadChart(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load position data');
    } finally {
      setLoading(false);
    }
  };

  // Progressive line rendering function
  const renderLinesProgressively = (drivers: string[]) => {
    let currentIndex = 0;
    
    const renderNextLine = () => {
      if (currentIndex < drivers.length) {
        setRenderedLines(prev => [...prev, drivers[currentIndex]]);
        currentIndex++;
        setTimeout(renderNextLine, 150); // 150ms delay between each line
      } else {
        // All lines rendered, hide loading overlay
        setTimeout(() => {
          setIsChartRendering(false);
        }, 300);
      }
    };
    
    renderNextLine();
  };

  // Convert real data to chart format - optimized for smooth rendering
  const convertRealDataToChartLines = (data: LapPositionDataPoint[]) => {
    const driverCodes = Object.keys(data[0] || {}).filter(key => key !== 'LapNumber');
    return driverCodes.map(code => ({
      code,
      data: data
        .map(lap => ({
          x: lap.LapNumber,
          y: lap[code] && lap[code] > 0 && lap[code] <= 20 ? lap[code] : null // Use null for invalid data
        }))
        .filter(point => point.x > 0) // Keep all points but with null values for invalid positions
    }));
  };

  // Only prepare data when chart should be loaded
  const filteredChartLines = shouldLoadChart ? (
    useMockData 
      ? chartLines.filter(line => selectedDrivers.includes(line.code))
      : realData 
        ? convertRealDataToChartLines(realData).filter(line => selectedDrivers.includes(line.code))
        : []
  ) : [];
  
  const maxLap = filteredChartLines.length > 0 
    ? Math.max(...filteredChartLines.flatMap(line => line.data.map(d => d.x))) 
    : 20;
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(screenWidth - 40, maxLap * 15); // Reduced multiplier for better performance
  const flipY = (y: number) => 21 - y;

  const getButtonText = () => {
    if (selectedDrivers.length === driverCodes.length) return "All Drivers";
    if (selectedDrivers.length === 0) return "Select Drivers...";
    return `${selectedDrivers.length} Selected`;
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
        onPress={loadPositionData}
        disabled={selectedDrivers.length === 0 || loading}
      >
        <MaterialIcons name="show-chart" size={20} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16, fontFamily: typography.fontFamily.semiBold }}>
          {loading ? 'Loading...' : 'Load Position Chart'}
        </Text>
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
        Select drivers and click load to view position changes
      </Text>
    </View>
  );

  return (
    <View style={styles.card}>
      <Text style={[commonStyles.title, { marginBottom: 16, textAlign: 'center', fontSize: 20}]}>
                    Lap-by-Lap Position Changes
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12.2, textAlign: 'center', marginBottom: 16, fontFamily: typography.fontFamily.regular }}>
                            Track driver positions throughout the race Use selector to filter
                  </Text>
      
      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <LoadingSpinnerF1 size={48} color="#ef4444" />
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
              onPress={() => setIsModalVisible(true)}
              disabled={driverCodes.length === 0}
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
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', fontFamily: typography.fontFamily.semiBold }}>
                  Select Drivers ({selectedDrivers.length}/{MAX_DRIVERS} max)
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2, fontFamily: typography.fontFamily.regular }}>
                  {getButtonText()}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.grey} />
            </TouchableOpacity>
          </View>

          {/* Load Button */}
          {!shouldLoadChart && selectedDrivers.length > 0 && renderLoadButton()}

      {/* Driver Selection Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
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
                <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4, fontFamily: typography.fontFamily.bold }}>
                  Select Drivers
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 14, fontFamily: typography.fontFamily.regular }}>
                  Choose which drivers to display on the chart
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)}
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
            
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              paddingBottom: 12,
              marginBottom: 12,
            }}>
              <TouchableOpacity 
                onPress={handleSelectAll} 
                style={{
                  backgroundColor: colors.primary + '20',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.primary,
                }}
              >
                <Text style={{ 
                  color: colors.primary, 
                  fontSize: 14, 
                  fontWeight: '600' 
                }}>
                  Select All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSelectNone} 
                style={{
                  backgroundColor: 'transparent',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ 
                  color: colors.textSecondary, 
                  fontSize: 14, 
                  fontWeight: '600' 
                }}>
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {driverCodes.map((driverCode) => {
                const isSelected = selectedDrivers.includes(driverCode);
                const driverColorValue = driverColor(driverCode);
                
                return (
                  <TouchableOpacity
                    key={driverCode}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                      marginBottom: 8,
                      backgroundColor: isSelected ? driverColorValue + '20' : '#202534ff',
                      borderRadius: 12,
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? driverColorValue : colors.border,
                    }}
                    onPress={() => handleDriverSelectionChange(driverCode)}
                  >
                    <View style={{ 
                      marginRight: 12, 
                      width: 40, 
                      height: 40, 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      backgroundColor: driverColorValue + '30', 
                      borderRadius: 20 
                    }}>
                      <Text style={{ 
                        color: driverColorValue, 
                        fontWeight: 'bold', 
                        fontSize: 14 
                      }}>
                        {driverCode}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ 
                        color: '#fff', 
                        fontWeight: '600', 
                        fontSize: 16 
                      }}>
                        {driverCode}
                      </Text>
                      <Text style={{ 
                        color: colors.textSecondary, 
                        fontSize: 12 
                      }}>
                        Driver {driverCode}
                      </Text>
                    </View>
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: driverColorValue,
                      marginLeft: 8,
                    }} />
                    {isSelected && (
                      <MaterialIcons 
                        name="check-circle" 
                        size={24} 
                        color={driverColorValue}
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
              backgroundColor: '#002f42',
              borderRadius: 8,
            }}>
              <Text style={{ color: colors.textSecondary, fontSize: 12, textAlign: 'center', fontFamily: typography.fontFamily.regular }}>
                {selectedDrivers.length} of {driverCodes.length} drivers selected
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Chart Content - Only render when loaded */}
      {shouldLoadChart && filteredChartLines.length > 0 && (
        <>
          {/* Horizontally Scrollable Chart Container */}
          <View style={{ position: 'relative' }}>
            <ScrollView 
              horizontal={true}
              showsHorizontalScrollIndicator={true}
              style={styles.chartContainer}
              contentContainerStyle={{ paddingRight: 0 }}
            >
              <View style={{ width: chartWidth, height: 280 }}>
                <VictoryChart
                  width={chartWidth}
                  height={280}
                  padding={{ left: 30, right: -10, top: 20, bottom: 50 }}
                  domainPadding={{ x: 15, y: 5 }}
                  domain={{ x: [1, maxLap], y: [1, 20] }}
                  containerComponent={
                    <VictoryContainer 
                      style={{ 
                        touchAction: "auto",
                        backgroundColor: "transparent"
                      }}
                    />
                  }
                  scale={{ x: "linear", y: "linear" }}
                >
                  <VictoryAxis
                    style={{
                      axis: { stroke: '#374151' },
                      tickLabels: { fill: '#9ca3af', fontSize: 8 },
                      grid: { stroke: '#374151', strokeDasharray: '2,2', strokeOpacity: 0.3 }
                    }}
                    tickCount={Math.min(10, maxLap)}
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
                      grid: { stroke: '#374151', strokeDasharray: '2,2', strokeOpacity: 0.3 }
                    }}
                  />
                  {filteredChartLines
                    .filter(line => renderedLines.includes(line.code)) // Only render lines that are ready
                    .map(line => {
                    const flippedData = line.data
                      .filter(point => point.y !== null) // Filter out null values
                      .map(point => ({
                        ...point,
                        y: flipY(point.y as number),
                      }));
                    return (
                      <VictoryLine
                        key={line.code}
                        name={line.code}
                        data={flippedData}
                        interpolation="monotoneX"
                        samples={100}
                        style={{
                          data: { 
                            stroke: driverColor(line.code), 
                            strokeWidth: 2.5,
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            strokeDasharray: isMainDriver(line.code) ? '0,0' : '5,5'
                          },
                        }}
                        animate={{
                          duration: 800,
                          onLoad: { duration: 400 }
                        }}
                      />
                    );
                  })}
                </VictoryChart>
              </View>
            </ScrollView>
            
            {/* Chart Rendering Overlay */}
            {isChartRendering && (
              <View style={styles.chartRenderingOverlay}>
                <View style={styles.renderingContent}>
                  <LoadingSpinnerF1 size={56} color="#ef4444" />
                </View>
              </View>
            )}
          </View>

          {/* Fixed Multi-Row Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendGrid}>
              {selectedDrivers.map(code => (
                <View key={code} style={styles.legendItem}>
                  <View style={styles.legendLineContainer}>
                    {isMainDriver(code) ? (
                      <View style={[styles.legendLine, { backgroundColor: driverColor(code) }]} />
                    ) : (
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
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingRight: 0,
    margin: 8,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
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
  // Chart Rendering Overlay Styles
  chartRenderingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#14141c',
    borderRadius: 16,
    borderColor: '#374151',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  renderingContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  renderingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ef4444',
    borderRadius: 2,
  },
});