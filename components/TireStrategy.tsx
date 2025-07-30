import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { fetchTireStrategy, fetchRaceResults, fetchStintAnalysis } from '../lib/api';
import { DriverStrategy, TireStint, StintAnalysisData, LapDetail } from '../lib/types';

interface TireStrategyProps {
  year: number;
  event: string;
  session: string;
}

interface RaceResult {
  position: number;
  driverCode: string;
}

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
            <Text style={styles.legendText}>
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
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loadingText}>Loading strategy data...</Text>
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
      </ScrollView>
    );
  };

  const renderStintAnalysis = () => {
    if (analysisLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loadingText}>Loading stint analysis...</Text>
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

      const avgLapTime = fastLapTimes.length > 0 ? fastLapTimes.reduce((a, b) => a + b, 0) / fastLapTimes.length : null;
      const fastestLap = allValidLapTimes.length > 0 ? Math.min(...allValidLapTimes) : null;
      const consistency = calculateStdDev(fastLapTimes);
      const degradation = calculateDegradation(allValidLapDetails);

      return {
        ...stint,
        stintLength: stint.endLap - stint.startLap + 1,
        avgLapTime,
        fastestLap,
        consistency,
        degradation,
        tireColor: getTireColor(stint.compound),
      };
    }).sort((a, b) => {
      if (a.driverCode < b.driverCode) return -1;
      if (a.driverCode > b.driverCode) return 1;
      return a.stintNumber - b.stintNumber;
    });

    const renderStintItem = ({ item }: { item: typeof processedStints[0] }) => (
      <View style={styles.stintItem}>
        <View style={styles.stintHeader}>
          <View style={styles.stintDriverInfo}>
            <Text style={styles.stintDriverCode}>{item.driverCode}</Text>
            <Text style={styles.stintNumber}>Stint {item.stintNumber}</Text>
          </View>
          <View style={styles.compoundInfo}>
            <View style={[styles.compoundDot, { backgroundColor: item.tireColor }]} />
            <Text style={styles.compoundText}>{item.compound}</Text>
          </View>
        </View>
        
        <View style={styles.stintStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Length</Text>
            <Text style={styles.statValue}>{item.stintLength} laps ({item.startLap}-{item.endLap})</Text>
          </View>
          
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Fastest</Text>
              <Text style={styles.statValue}>{formatLapTime(item.fastestLap)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Average</Text>
              <Text style={styles.statValue}>{formatLapTime(item.avgLapTime)}</Text>
            </View>
          </View>

          {(session === 'R' || session === 'SPRINT' || session === 'Race') && (
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Consistency (σ)</Text>
                <Text style={styles.statValue}>{item.consistency?.toFixed(3) ?? 'N/A'}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Degradation</Text>
                <Text style={[
                  styles.statValue,
                  item.degradation !== null && item.degradation > 0 
                    ? styles.degradationBad 
                    : styles.degradationGood
                ]}>
                  {item.degradation !== null ? `${item.degradation.toFixed(2)}s/lap` : 'N/A'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );

    return (
      <ScrollView style={styles.analysisContainer} showsVerticalScrollIndicator={false}>
        <FlatList
          data={processedStints}
          renderItem={renderStintItem}
          keyExtractor={(item) => `${item.driverCode}-${item.stintNumber}`}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
        
        {(session === 'R' || session === 'SPRINT' || session === 'Race') && (
          <View style={styles.explanationContainer}>
            <Text style={styles.explanationTitle}>Explanations:</Text>
            <Text style={styles.explanationText}>
              • <Text style={styles.explanationBold}>Consistency (σ):</Text> Standard deviation of lap times (excluding first/last lap). Lower is more consistent.
            </Text>
            <Text style={styles.explanationText}>
              • <Text style={styles.explanationBold}>Degradation:</Text> Change in lap time per lap. Positive means getting slower over the stint.
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Strategy Analysis</Text>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
          onPress={() => setSelectedTab('overview')}
        >
          <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'analysis' && styles.activeTab]}
          onPress={() => setSelectedTab('analysis')}
        >
          <Text style={[styles.tabText, selectedTab === 'analysis' && styles.activeTabText]}>
            Stint Detail
          </Text>
        </TouchableOpacity>
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
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 16,
    margin: 0,
    marginHorizontal: 8,
    marginVertical: 8,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#4b5563',
  },
  tabText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  tabContent: {
    flex: 1,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    borderRadius: 2,
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
    padding: 10,
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
});

export default TireStrategy;
