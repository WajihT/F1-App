import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { colors, typography } from '../styles/commonStyles';
import DateTimePicker from '@react-native-community/datetimepicker';

interface CustomDatePickerProps {
  isVisible: boolean;
  date: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  title?: string;
  confirmText?: string;
  cancelText?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  isVisible,
  date,
  onConfirm,
  onCancel,
  title = "Select Date",
  confirmText = "Confirm",
  cancelText = "Cancel"
}) => {
  const [selectedDate, setSelectedDate] = useState(date);

  // Update selected date when prop changes
  React.useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  const handleConfirm = () => {
    onConfirm(selectedDate);
    onCancel(); // Close the modal after confirming
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'dismissed') {
        onCancel();
        return;
      }
      if (date) {
        onConfirm(date);
      }
    } else if (date) {
      setSelectedDate(date);
    }
  };

  // For Android, return the picker directly without modal
  if (Platform.OS === 'android') {
    return isVisible ? (
      <DateTimePicker
        value={selectedDate}
        mode="date"
        display="default"
        onChange={handleDateChange}
      />
    ) : null;
  }

  // For iOS, show custom styled modal with native DateTimePicker
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onCancel}
    >
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      }}>
        <View style={{
          backgroundColor: colors.darkCard,
          borderRadius: 20,
          padding: 0,
          margin: 20,
          width: Dimensions.get('window').width * 0.9,
          maxWidth: 400,
          borderWidth: 2,
          borderColor: colors.primary,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <View style={{
            backgroundColor: colors.primary,
            paddingVertical: 16,
            paddingHorizontal: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={{ 
                color: colors.accent, 
                fontSize: 16, 
                fontFamily: typography.fontFamily.regular 
              }}>
                {cancelText}
              </Text>
            </TouchableOpacity>
            <Text style={{ 
              color: colors.accent, 
              fontSize: 18, 
              fontFamily: typography.fontFamily.bold 
            }}>
              {title}
            </Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={{ 
                color: colors.accent, 
                fontSize: 16, 
                fontFamily: typography.fontFamily.bold 
              }}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>

          {/* DateTimePicker */}
          <View style={{
            backgroundColor: colors.darkCard,
            paddingVertical: 20,
          }}>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              style={{
                backgroundColor: colors.darkCard,
              }}
            />
          </View>

          {/* Selected Date Display */}
          <View style={{
            backgroundColor: colors.backgroundAlt,
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}>
            <Text style={{
              color: colors.text,
              fontSize: 16,
              textAlign: 'center',
              fontFamily: typography.fontFamily.regular,
            }}>
              Selected: {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomDatePicker;