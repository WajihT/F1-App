import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { MaterialIcons, AntDesign, Feather } from '@expo/vector-icons';
import { fetchTireStrategy, fetchRaceResults, fetchStintAnalysis } from '../lib/api';
import { DriverStrategy, TireStint, StintAnalysisData, LapDetail } from '../lib/types';
import { commonStyles, colors, typography } from '../styles/commonStyles';
import Svg, { Path, Rect } from 'react-native-svg';
import LoadingSpinnerF1 from './LoadingSpinnerF1';

interface TireStrategyProps {
  year: number;
  event: string;
  session: string;
}

interface RaceResult {
  position: number;
  driverCode: string;
}
const ChartLineIcon = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 3v16a2 2 0 0 0 2 2h16" />
    <Path d="m19 9-5 5-4-4-3 3" />
  </Svg>
);
// Define tire compound colors
const tireCompoundColors: { [key: string]: string } = {
  SOFT: '#ef4444',      // Red
  MEDIUM: '#facc15',    // Yellow
  HARD: '#e5e7eb',      // Light Gray
  INTERMEDIATE: '#22c55e', // Green
  WET: '#3b82f6',       // Blue
  UNKNOWN: '#6b7280',   // Gray
};

const getTireColor = (compound: string): string => {
  return tireCompoundColors[compound?.toUpperCase()] || tireCompoundColors.UNKNOWN;
};

const TireStrategy: React.FC<TireStrategyProps> = ({ year, event, session }) => {
  const [strategyData, setStrategyData] = useState<DriverStrategy[]>([]);
  const [raceResults, setRaceResults] = useState<RaceResult[]>([]);
  const [stintAnalysis, setStintAnalysis] = useState<StintAnalysisData[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'analysis'>('overview');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Helper functions for stint analysis
  const formatLapTime = (totalSeconds: number | null | undefined): string => {
    if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds)) {
      return 'N/A';
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedSeconds = seconds.toFixed(3).padStart(6, '0');
    return `${minutes}:${formattedSeconds}`;
  };

  const calculateStdDev = (arr: number[]): number | null => {
    if (!arr || arr.length < 2) return null;
    const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
    const variance = arr.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / arr.length;
    return Math.sqrt(variance);
  };

  const calculateDegradation = (lapDetails: LapDetail[]): number | null => {
    const validLaps = lapDetails.length > 2 ? lapDetails.slice(1, -1) : [];
    if (validLaps.length < 2) return null;

    const n = validLaps.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    validLaps.forEach(lap => {
      const x = lap.lapNumber;
      const y = lap.lapTime;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    });

    const denominator = n * sumX2 - sumX * sumX;
    if (denominator === 0) return 0;

    return (n * sumXY - sumX * sumY) / denominator;
  };

  // Sorting function
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortData = (data: any[], column: string, direction: 'asc' | 'desc') => {
    return [...data].sort((a, b) => {
      let aValue, bValue;
      
      switch (column) {
        case 'driver':
          aValue = a.driverCode;
          bValue = b.driverCode;
          break;
        case 'length':
          aValue = a.stintLength;
          bValue = b.stintLength;
          break;
        case 'fastest':
          aValue = a.fastestLap || Infinity;
          bValue = b.fastestLap || Infinity;
          break;
        case 'consistency':
          aValue = a.consistency || Infinity;
          bValue = b.consistency || Infinity;
          break;
        case 'degradation':
          aValue = a.degradation || 0;
          bValue = b.degradation || 0;
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return direction === 'asc' ? comparison : -comparison;
      } else {
        const comparison = aValue - bValue;
        return direction === 'asc' ? comparison : -comparison;
      }
    });
  };

  // Create a map of driver codes to their finishing positions
  const driverPositionMap = useMemo(() => {
    const positionMap = new Map<string, number>();
    raceResults.forEach(result => {
      if (result.position !== undefined && result.position !== null && isFinite(result.position)) {
        positionMap.set(result.driverCode, result.position);
      }
    });
    return positionMap;
  }, [raceResults]);

  // Find max laps for scaling the bars
  const maxLaps = useMemo(() => {
    if (!strategyData || strategyData.length === 0) return 1;
    return Math.max(...strategyData.flatMap(d => d.stints.map(s => s.endLap)), 1);
  }, [strategyData]);

  // Sort strategy data by race finishing order
  const sortedStrategyData = useMemo(() => {
    if (!strategyData) return [];
    return [...strategyData].sort((a, b) => {
      const posA = driverPositionMap.get(a.driver);
      const posB = driverPositionMap.get(b.driver);
      if (posA !== undefined && posB !== undefined) return posA - posB;
      if (posA !== undefined) return -1;
      if (posB !== undefined) return 1;
      return a.driver.localeCompare(b.driver);
    });
  }, [strategyData, driverPositionMap]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load both strategy data and race results
        const [strategy, results] = await Promise.all([
          fetchTireStrategy(year, event, session),
          fetchRaceResults(year, event, session).catch(() => []) // Don't fail if race results aren't available
        ]);
        
        setStrategyData(strategy);
        setRaceResults(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tire strategy data');
      } finally {
        setLoading(false);
      }
    };

    if (year && event && session) {
      loadData();
    }
  }, [year, event, session]);

  // Load stint analysis data when switching to analysis tab
  useEffect(() => {
    const loadStintAnalysis = async () => {
      if (selectedTab !== 'analysis') return;
      
      setAnalysisLoading(true);
      setAnalysisError(null);
      try {
        const analysis = await fetchStintAnalysis(year, event, session);
        setStintAnalysis(analysis);
      } catch (err) {
        setAnalysisError(err instanceof Error ? err.message : 'Failed to load stint analysis data');
      } finally {
        setAnalysisLoading(false);
      }
    };

    if (year && event && session && selectedTab === 'analysis') {
      loadStintAnalysis();
    }
  }, [year, event, session, selectedTab]);

  const renderLegend = () => (
    <View style={styles.legendContainer}>
      {Object.entries(tireCompoundColors).map(([compound, color]) => {
        if (compound === 'UNKNOWN') return null;
        return (
          <View key={compound} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: color }]} />
            <Text style={[styles.legendText, { fontFamily: typography.fontFamily.regular }]}>
              {compound.charAt(0) + compound.slice(1).toLowerCase()}
            </Text>
          </View>
        );
      })}
    </View>
  );

  const renderStrategyOverview = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingSpinnerF1 size={48} color="#ef4444" />
          
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              // Reload data
              const loadData = async () => {
                setLoading(true);
                setError(null);
                try {
                  const [strategy, results] = await Promise.all([
                    fetchTireStrategy(year, event, session),
                    fetchRaceResults(year, event, session).catch(() => [])
                  ]);
                  setStrategyData(strategy);
                  setRaceResults(results);
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to load tire strategy data');
                } finally {
                  setLoading(false);
                }
              };
              loadData();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!sortedStrategyData || sortedStrategyData.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tire strategy data found for this session.</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.strategyContainer} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 16 }}>
          {renderLegend()}
          <View style={styles.driverList}>
            {sortedStrategyData.map((driverData) => {
              const isRaceSession = session === 'R' || session === 'SPRINT' || session === 'Race';
              const position = isRaceSession ? driverPositionMap.get(driverData.driver) : undefined;
              const positionText = position !== undefined && isFinite(position) ? `P${position}` : '';
              
              return (
                <View key={driverData.driver} style={styles.driverRow}>
                  <View style={styles.driverInfo}>
                    <Text style={styles.driverCode}>{driverData.driver}</Text>
                    {positionText && (
                      <Text style={styles.positionText}>{positionText}</Text>
                    )}
                  </View>
                  <View style={styles.stintBar}>
                    {driverData.stints.map((stint, index) => {
                      const widthPercentage = ((stint.endLap - stint.startLap + 1) / maxLaps) * 100;
                      const leftOffsetPercentage = ((stint.startLap - 1) / maxLaps) * 100;
                      const backgroundColor = getTireColor(stint.compound);
                      
                      return (
                        <View
                          key={index}
                          style={[
                            styles.stint,
                            {
                              backgroundColor,
                              left: `${leftOffsetPercentage}%`,
                              width: `${widthPercentage}%`,
                            }
                          ]}
                        />
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderStintAnalysis = () => {
    if (analysisLoading) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingSpinnerF1 size={48} color="#ef4444" />
          
        </View>
      );
    }

    if (analysisError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {analysisError}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setAnalysisLoading(true);
              setAnalysisError(null);
              fetchStintAnalysis(year, event, session)
                .then(setStintAnalysis)
                .catch(err => setAnalysisError(err instanceof Error ? err.message : 'Failed to load stint analysis data'))
                .finally(() => setAnalysisLoading(false));
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!stintAnalysis || stintAnalysis.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No stint analysis data available for this session.</Text>
        </View>
      );
    }

    // Process stint analysis data
    const processedStints = stintAnalysis.map(stint => {
      const allValidLapDetails = stint.lapDetails;
      const allValidLapTimes = allValidLapDetails.map(detail => detail.lapTime);
      const fastLapDetails = allValidLapDetails.length > 2 ? allValidLapDetails.slice(1, -1) : [];
      const fastLapTimes = fastLapDetails.map(detail => detail.lapTime);

      const fastestLap = allValidLapTimes.length > 0 ? Math.min(...allValidLapTimes) : null;
      const consistency = calculateStdDev(fastLapTimes);
      const degradation = calculateDegradation(allValidLapDetails);

      return {
        ...stint,
        stintLength: stint.endLap - stint.startLap + 1,
        fastestLap,
        consistency,
        degradation,
        tireColor: getTireColor(stint.compound),
      };
    });

    // Apply sorting if a column is selected
    const sortedStints = sortColumn 
      ? sortData(processedStints, sortColumn, sortDirection)
      : processedStints.sort((a, b) => {
          if (a.driverCode < b.driverCode) return -1;
          if (a.driverCode > b.driverCode) return 1;
          return a.stintNumber - b.stintNumber;
        });

    return (
      <ScrollView style={styles.analysisContainer} showsVerticalScrollIndicator={false}>
        
        
        {/* Table Container */}
        <View style={styles.tableContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableScrollContainer}>
            <View style={styles.tableContent}>
              {/* Column Headers */}
              <View style={[styles.tableRow, styles.headerRow]}>
                <View style={[styles.tableCell, styles.driverColumn]}>
                  <TouchableOpacity 
                    style={styles.columnHeaderContainer}
                    onPress={() => handleSort('driver')}
                  >
                    <Text style={styles.columnHeaderText}>Driver</Text>
                    <View style={styles.sortArrows}>
                      <AntDesign 
                        name="arrowup" 
                        size={14} 
                        color={sortColumn === 'driver' && sortDirection === 'asc' ? colors.primary : colors.textSecondary} 
                      />
                      <AntDesign 
                        name="arrowdown" 
                        size={14} 
                        color={sortColumn === 'driver' && sortDirection === 'desc' ? colors.primary : colors.textSecondary} 
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={[styles.tableCell, styles.stintColumn]}>
                  <Text style={styles.columnHeaderText}>Stint</Text>
                </View>
                <View style={[styles.tableCell, styles.compoundColumn]}>
                  <Text style={styles.columnHeaderText}>Compound</Text>
                </View>
                <View style={[styles.tableCell, styles.lengthColumn]}>
                  <TouchableOpacity 
                    style={styles.columnHeaderContainer}
                    onPress={() => handleSort('length')}
                  >
                    <Text style={styles.columnHeaderText}>Length</Text>
                    <View style={styles.sortArrows}>
                      <AntDesign 
                        name="arrowup" 
                        size={14} 
                        color={sortColumn === 'length' && sortDirection === 'asc' ? colors.primary : colors.textSecondary} 
                      />
                      <AntDesign 
                        name="arrowdown" 
                        size={14} 
                        color={sortColumn === 'length' && sortDirection === 'desc' ? colors.primary : colors.textSecondary} 
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={[styles.tableCell, styles.fastestColumn]}>
                  <TouchableOpacity 
                    style={styles.columnHeaderContainer}
                    onPress={() => handleSort('fastest')}
                  >
                    <Text style={styles.columnHeaderText}>Fastest</Text>
                    <View style={styles.sortArrows}>
                      <AntDesign 
                        name="arrowup" 
                        size={14} 
                        color={sortColumn === 'fastest' && sortDirection === 'asc' ? colors.primary : colors.textSecondary} 
                      />
                      <AntDesign 
                        name="arrowdown" 
                        size={14} 
                        color={sortColumn === 'fastest' && sortDirection === 'desc' ? colors.primary : colors.textSecondary} 
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={[styles.tableCell, styles.consistencyColumn]}>
                  <TouchableOpacity 
                    style={styles.columnHeaderContainer}
                    onPress={() => handleSort('consistency')}
                  >
                    <Text style={styles.columnHeaderText}>Consistency</Text>
                    <View style={styles.sortArrows}>
                      <AntDesign 
                        name="arrowup" 
                        size={14} 
                        color={sortColumn === 'consistency' && sortDirection === 'asc' ? colors.primary : colors.textSecondary} 
                      />
                      <AntDesign 
                        name="arrowdown" 
                        size={14} 
                        color={sortColumn === 'consistency' && sortDirection === 'desc' ? colors.primary : colors.textSecondary} 
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={[styles.tableCell, styles.degradationColumn]}>
                  <TouchableOpacity 
                    style={styles.columnHeaderContainer}
                    onPress={() => handleSort('degradation')}
                  >
                    <Text style={styles.columnHeaderText}>Degradation</Text>
                    <View style={styles.sortArrows}>
                      <AntDesign 
                        name="arrowup" 
                        size={14} 
                        color={sortColumn === 'degradation' && sortDirection === 'asc' ? colors.primary : colors.textSecondary} 
                      />
                      <AntDesign 
                        name="arrowdown" 
                        size={14} 
                        color={sortColumn === 'degradation' && sortDirection === 'desc' ? colors.primary : colors.textSecondary} 
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Table Data Rows */}
              {sortedStints.map((item, index) => (
                <View key={`${item.driverCode}-${item.stintNumber}`} style={[styles.tableRow, styles.dataRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
                  <View style={[styles.tableCell, styles.driverColumn]}>
                    <Text style={[styles.driverText, { fontFamily: typography.fontFamily.regular }]}>{item.driverCode}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.stintColumn]}>
                    <Text style={[styles.dataText, { fontFamily: typography.fontFamily.regular }]}>{item.stintNumber}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.compoundColumn]}>
                    <View style={styles.compoundContainer}>
                      <View style={[styles.compoundDot, { backgroundColor: item.tireColor }]} />
                      <Text style={[styles.compoundText, { fontFamily: typography.fontFamily.regular }]}>{item.compound}</Text>
                    </View>
                  </View>
                  <View style={[styles.tableCell, styles.lengthColumn]}>
                    <Text style={[styles.dataText, { fontFamily: typography.fontFamily.regular }]}>{item.stintLength} Laps ({item.startLap}-{item.endLap})</Text>
                  </View>
                  <View style={[styles.tableCell, styles.fastestColumn]}>
                    <Text style={[styles.dataText, { fontFamily: typography.fontFamily.regular }]}>{formatLapTime(item.fastestLap)}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.consistencyColumn]}>
                    <Text style={[styles.dataText, { fontFamily: typography.fontFamily.regular }]}>{item.consistency?.toFixed(3) ?? 'N/A'}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.degradationColumn]}>
                    <View style={styles.degradationContainer}>
                      {item.degradation !== null ? (
                        <>
                          <Feather 
                            name={item.degradation > 0 ? "trending-up" : "trending-down"} 
                            size={20} 
                            color={item.degradation > 0 ? '#ff6b6b' : '#51cf66'} 
                            style={{ marginRight: 4 }}
                          />
                          <Text style={[
                            styles.dataText,
                            item.degradation > 0 ? styles.degradationBad : styles.degradationGood,
                            { fontFamily: typography.fontFamily.regular }
                          ]}>
                            {Math.abs(item.degradation).toFixed(2)}s/lap
                          </Text>
                        </>
                      ) : (
                        <Text style={styles.dataText}>N/A</Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
        
        {(session === 'R' || session === 'SPRINT' || session === 'Race') && (
          <View style={[styles.explanationContainer, { marginHorizontal: 16 }]}>
            <Text style={styles.explanationTitle}>Explanations:</Text>
            <Text style={styles.explanationText}>
              • <Text style={styles.explanationBold}>Consistency (σ):</Text> Standard deviation of lap times (excluding first/last lap). Lower is more consistent.
            </Text>
            <Text style={styles.explanationText}>
              • <Text style={styles.explanationBold}>Degradation:</Text> Change in lap time per lap. ↗ = getting slower, ↘ = getting faster.
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={[commonStyles.title, { marginBottom: 16, textAlign: 'center', fontSize: 24}]}>
          Strategy Analysis
        </Text>
       
        
        {/* Tab Navigation */}
        <View style={{ 
          flexDirection: 'row', 
          backgroundColor: "#14141c",
          borderColor: "#212a39",
          borderWidth: 1,
          borderRadius: 8, 
          padding: 1.5, 
          marginHorizontal: -16,
          marginBottom: 16 
        }}>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingHorizontal: 0,
              paddingVertical: 8,
              borderRadius: 6,
              backgroundColor: selectedTab === 'overview' ? colors.primary : 'transparent',
              alignItems: 'center',
            }}
            onPress={() => setSelectedTab('overview')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="format-list-bulleted" size={18} color="white" />
              <Text style={{ 
                color: selectedTab === 'overview' ? '#fff' : colors.textSecondary, 
                //fontWeight: selectedTab === 'overview' ? 'bold' : 'normal',
                fontSize: 12,
                fontFamily: selectedTab === 'overview' ? typography.fontFamily.bold : typography.fontFamily.regular
              }}>
                Overview
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingHorizontal: 0,
              paddingVertical: 8,
              borderRadius: 6,
              backgroundColor: selectedTab === 'analysis' ? colors.primary : 'transparent',
              alignItems: 'center',
            }}
            onPress={() => setSelectedTab('analysis')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <ChartLineIcon size={18} color="white" />
              <Text style={{ 
                color: selectedTab === 'analysis' ? '#fff' : colors.textSecondary, 
                //fontWeight: selectedTab === 'analysis' ? 'bold' : 'normal',
                fontSize: 12, 
                fontFamily: selectedTab === 'analysis' ? typography.fontFamily.bold : typography.fontFamily.regular
              }}>
                Stint Detail
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Tab Content */}
      <View style={styles.tabContent}>
        {selectedTab === 'overview' ? renderStrategyOverview() : renderStintAnalysis()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 0,
    margin: 0,
    marginHorizontal: 0,
    marginVertical: 8,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
  },
  tabContent: {
    flex: 1,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 2,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    color: '#9ca3af',
    fontSize: 11,
  },
  strategyContainer: {
    flex: 1,
  },
  driverList: {
    paddingHorizontal: 0,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 0,
  },
  driverInfo: {
    width: 50,
    alignItems: 'flex-start',
    marginRight: 8,
    paddingLeft: 4,
  },
  driverCode: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
  },
  positionText: {
    color: '#6b7280',
    fontSize: 10,
  },
  stintBar: {
    flex: 1,
    height: 24,
    backgroundColor: '#374151',
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
    marginLeft: 0,
  },
  stint: {
    position: 'absolute',
    height: '100%',
    borderRadius: 0,
  },
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
  },
  analysisContainer: {
    padding: 0,
  },
  analysisText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  // Stint Analysis Styles
  stintItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  stintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stintDriverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stintDriverCode: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    minWidth: 40,
  },
  stintNumber: {
    color: '#aaa',
    fontSize: 14,
  },
  compoundInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compoundDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  compoundText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  stintStats: {
    marginTop: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  statItem: {
    flex: 1,
    marginRight: 8,
  },
  statLabel: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 2,
  },
  statValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  degradationBad: {
    color: '#ff6b6b',
  },
  degradationGood: {
    color: '#51cf66',
  },
  explanationContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  explanationTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  explanationText: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  explanationBold: {
    fontWeight: 'bold',
    color: '#fff',
  },
  // Table Styles
  tableContainer: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  tableScrollContainer: {
    flex: 1,
  },
  tableContent: {
    minWidth: 800, // Increase minimum width for wider columns
  },
  tableHeaderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    minHeight: 48,
  },
  dataRow: {
    backgroundColor: 'transparent',
  },
  headerRow: {
    backgroundColor: '#374151',
    borderBottomWidth: 2,
    borderBottomColor: '#4b5563',
  },
  evenRow: {
    backgroundColor: '#1f2937',
  },
  oddRow: {
    backgroundColor: '#111827',
  },
  tableCell: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  driverColumn: {
    width: 80,
    marginRight: 16, // Add gap after driver column
  },
  stintColumn: {
    width: 60,
    alignItems: 'center',
  },
  compoundColumn: {
    width: 140,
    marginRight: 12, // Add gap after compound column
  },
  lengthColumn: {
    width: 160,
  },
  fastestColumn: {
    width: 100,
  },
  consistencyColumn: {
    width: 110,
    marginRight: 24, // Increase gap before degradation column
  },
  degradationColumn: {
    width: 130,
  },
  columnHeaderText: {
    color: '#e5e7eb',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  columnHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortArrows: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  driverText: {
    color: '#3b82f6',
    fontSize: 13,
    fontWeight: 'bold',
  },
  dataText: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '500',
  },
  compoundContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  degradationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default TireStrategy;
