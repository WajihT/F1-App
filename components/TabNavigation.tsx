import { View, Text, TouchableOpacity } from 'react-native';
import { commonStyles, colors, typography } from '../styles/commonStyles';
import Icon from './Icon';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import React from 'react';
import TireIcon from "../assets/TireIcon";

interface TabNavigationProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: 'Home', icon: <TireIcon width={22} height={22} /> },
  { id: 'standings', label: 'Standings', icon: <Ionicons name="trophy-outline" size={22} /> },
  { id: 'calendar', label: 'Calendar', icon: <Feather name="calendar" size={22} /> },
  { id: 'profile', label: 'Profile', icon: <Ionicons name="person-circle-outline" size={22} /> },
];

export default function TabNavigation({ activeTab, onTabPress }: TabNavigationProps) {
  return (
    <View style={[commonStyles.tabBar, { backgroundColor: '#010103', borderTopWidth: 1, borderColor: '#222' }]}>
      <View style={[commonStyles.row, { justifyContent: 'space-around', paddingVertical: 6 }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={{
              alignItems: 'center',
              flex: 1,
              paddingVertical: 6,
              borderRadius: 12,
              backgroundColor: activeTab === tab.id ? 'rgba(239,68,68,0.10)' : 'transparent',
              marginLeft: tab.id === 'home' ? 5 : 0, // 2px left margin for Home
              marginRight: tab.id === 'profile' ? 5 : 0, // 2px right margin for Profile
            }}
            onPress={() => onTabPress(tab.id)}
            activeOpacity={0.8}
          >
            <View>
              {React.cloneElement(tab.icon, {
                color: activeTab === tab.id ? 'white' : colors.grey,
              })}
            </View>
            <Text
              style={{
                color: activeTab === tab.id ? 'white' : colors.grey,
                fontWeight: activeTab === tab.id ? '500' : '500',
                fontSize: 13,
                marginTop: 2,
                letterSpacing: 0.2,
                fontFamily: typography.fontFamily.bold
              }}
            >
              {tab.label}
            </Text>
            {activeTab === tab.id && (
              <View style={{
                height: 3,
                borderRadius: 2,
                backgroundColor: 'red',
                marginTop: 4,
                width: 24,
                alignSelf: 'center',
              }} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}