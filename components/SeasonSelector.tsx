import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import { Season, getAvailableSeasons } from '../services/f1DataService';

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
        style={styles.selector}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.selectorText}>{selectedSeason} Season</Text>
        <Icon name="chevron-down" size={20} style={{ color: colors.text }} />
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
              <Text style={styles.modalTitle}>Select Season</Text>
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
                  <Text style={[
                    styles.seasonText,
                    selectedSeason === season.year && styles.selectedSeasonText
                  ]}>
                    {season.label}
                  </Text>
                  {selectedSeason === season.year && (
                    <Icon name="checkmark" size={20} style={{ color: colors.primary }} />
                  )}
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
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Roboto_600SemiBold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
  },
  closeButton: {
    padding: 4,
  },
  seasonList: {
    maxHeight: 400,
  },
  seasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedSeasonItem: {
    backgroundColor: colors.card,
  },
  seasonText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Roboto_400Regular',
  },
  selectedSeasonText: {
    fontWeight: '600',
    color: colors.primary,
    fontFamily: 'Roboto_600SemiBold',
  },
});