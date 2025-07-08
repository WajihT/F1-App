import { View, Text, TouchableOpacity } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';

interface TabNavigationProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: 'Home', icon: 'home' as const },
  { id: 'standings', label: 'Standings', icon: 'trophy' as const },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' as const },
  { id: 'profile', label: 'Profile', icon: 'person' as const },
];

export default function TabNavigation({ activeTab, onTabPress }: TabNavigationProps) {
  return (
    <View style={commonStyles.tabBar}>
      <View style={commonStyles.row}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={commonStyles.tabItem}
            onPress={() => onTabPress(tab.id)}
          >
            <Icon
              name={tab.icon}
              size={24}
              style={{
                color: activeTab === tab.id ? colors.primary : colors.grey,
              }}
            />
            <Text
              style={[
                commonStyles.tabText,
                {
                  color: activeTab === tab.id ? colors.primary : colors.grey,
                  fontWeight: activeTab === tab.id ? '600' : '400',
                }
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}