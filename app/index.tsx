import { View } from 'react-native';
import { useState } from 'react';
import { commonStyles } from '../styles/commonStyles';
import TabNavigation from '../components/TabNavigation';
import HomeScreen from '../screens/HomeScreen';
import StandingsScreen from '../screens/StandingsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ProfileScreen from '../screens/ProfileScreen';

export default function MainScreen() {
  const [activeTab, setActiveTab] = useState('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'standings':
        return <StandingsScreen />;
      case 'calendar':
        return <CalendarScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={commonStyles.container}>
      {renderScreen()}
      <TabNavigation activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
}