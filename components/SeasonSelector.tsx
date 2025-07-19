import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import { Season, getAvailableSeasons } from '../services/f1DataService';
import Ionicons from '@expo/vector-icons/Ionicons';

interface SeasonSelectorProps {
  selectedSeason: number;
  onSeasonChange: (season: number) => void;
}

export default function SeasonSelector({ selectedSeason, onSeasonChange }: SeasonSelectorProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const seasons = getAvailableSeasons();

  const handleSeasonSelect = (season: number) => {
    console.log(`Season selected: ${season}`);
    onSeasonChange(season);
    setIsModalVisible(false);
  };

return (
  <View style={styles.container}>
<TouchableOpacity
  style={[
    styles.selector,
    {
      width: 200,
      alignSelf: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.2)',
      backgroundColor: '#0d111c',
      borderRadius: 16,
      shadowColor: '#991b1b',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    }
  ]}
  onPress={() => setIsModalVisible(true)}
>
  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
    <View
      style={{
        backgroundColor: 'rgba(239,68,68,0.2)',
        borderRadius: 999,
        padding: 6,
        marginRight: 8,
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      }}
    >
      <Ionicons name="trophy-outline" size={16} color="#f87171" />
    </View>
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      <Text
        style={{
          fontWeight: '500',
          color: '#fff',
          fontSize: 16,
          textAlign: 'center',
          flex: 1,
        }}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {selectedSeason}
      </Text>
      {/* F1 badge and chevron in the same row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
        <View
          style={{
            backgroundColor: 'rgba(220,38,38,0.7)',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 999,
            marginRight: 6,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600', textAlign: 'center' }}>F1</Text>
        </View>
        <Icon
          name="chevron-down"
          size={20}
          style={{
            color: colors.text,
            opacity: 0.7,
            transform: [{ rotate: isModalVisible ? '180deg' : '0deg' }],
          }}
        />
      </View>
    </View>
  </View>
</TouchableOpacity>

    <Modal
      visible={isModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Season</Text>
            <Text style={styles.seasonsCount}>{seasons.length} seasons</Text>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} style={{ color: colors.text }} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.seasonList} showsVerticalScrollIndicator={false}>
            {seasons.map((season) => (
              <TouchableOpacity
                key={season.year}
                style={[
                  styles.seasonItem,
                  selectedSeason === season.year && styles.selectedSeasonItem
                ]}
                onPress={() => handleSeasonSelect(season.year)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Text style={styles.yearMono}>{season.year}</Text>
                  <Text style={styles.formulaText}>Formula 1</Text>
                  {selectedSeason === season.year && (
                    <View style={styles.selectedDot} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(24, 24, 27, 0.95)', // bg-gray-900/95
    borderRadius: 16, // rounded-xl
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)', // border-gray-700/50
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 8, // shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)]
  },
  selectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff', // text-white
    fontFamily: 'Roboto_600SemiBold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'rgba(24, 24, 27, 0.95)', // bg-gray-900/95
    borderRadius: 16,
    width: '60%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)', // border-red-500/20
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 8,
    backdropFilter: 'blur(12px)', // backdrop-blur-xl (not supported natively, but for reference)
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937', // border-gray-800
    backgroundColor: 'transparent',
  },
  modalTitle: {
    fontSize: 12,
    color: '#9ca3af', // text-gray-400
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  seasonList: {
    maxHeight: 300,
    paddingVertical: 4,
  },
  seasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937', // border-gray-800
    backgroundColor: 'transparent',
  },
  selectedSeasonItem: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)', // data-[state=checked]:bg-red-600/30
  },
  seasonText: {
    fontSize: 16,
    color: '#fff', // text-white
    fontFamily: 'Roboto_400Regular',
  },
  selectedSeasonText: {
    fontWeight: '600',
    color: '#fff', // data-[state=checked]:text-white
    fontFamily: 'Roboto_600SemiBold',
  },
  yearMono: {
    width: 48,
    color: '#9ca3af', // text-gray-400
    fontFamily: 'monospace',
    fontSize: 14,
  },
  formulaText: {
    fontWeight: '500',
    marginLeft: 8,
    color: '#fff',
    fontSize: 15,
  },
  selectedDot: {
    marginLeft: 'auto',
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444', // bg-red-500
  },
  seasonsCount: {
    fontSize: 12,
    color: '#6b7280', // text-gray-500
  },
});