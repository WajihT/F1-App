import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from '../components/Icon';
import Button from '../components/Button';

const userStats = {
  name: 'F1 Fan',
  favoriteTeam: 'Red Bull Racing',
  favoriteDriver: 'Max Verstappen',
  racesWatched: 156,
  predictionsCorrect: 89,
  memberSince: 'March 2020',
};

const menuItems = [
  { id: 1, title: 'Notifications', icon: 'notifications' as const, hasSwitch: true },
  { id: 2, title: 'Favorite Teams', icon: 'heart' as const, hasSwitch: false },
  { id: 3, title: 'Race Reminders', icon: 'alarm' as const, hasSwitch: true },
  { id: 4, title: 'Data & Privacy', icon: 'shield-checkmark' as const, hasSwitch: false },
  { id: 5, title: 'About', icon: 'information-circle' as const, hasSwitch: false },
];

export default function ProfileScreen() {
  const handleMenuPress = (item: typeof menuItems[0]) => {
    Alert.alert(item.title, `${item.title} settings would open here.`);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => console.log('User signed out') },
      ]
    );
  };

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={commonStyles.section}>
          <View style={[commonStyles.card, { backgroundColor: colors.primary }]}>
            <View style={commonStyles.centerContent}>
              <View style={[
                commonStyles.centerContent,
                {
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: colors.accent,
                  marginBottom: 16,
                }
              ]}>
                <Icon name="person" size={40} style={{ color: colors.primary }} />
              </View>
              <Text style={[commonStyles.title, { color: colors.accent, textAlign: 'center' }]}>
                {userStats.name}
              </Text>
              <Text style={[commonStyles.textSecondary, { color: colors.accent, opacity: 0.8, textAlign: 'center' }]}>
                Member since {userStats.memberSince}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Your F1 Stats</Text>
          <View style={commonStyles.row}>
            <View style={[commonStyles.card, { flex: 1, marginRight: 8 }]}>
              <Text style={[commonStyles.title, { textAlign: 'center', color: colors.primary }]}>
                {userStats.racesWatched}
              </Text>
              <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
                Races Watched
              </Text>
            </View>
            <View style={[commonStyles.card, { flex: 1, marginLeft: 8 }]}>
              <Text style={[commonStyles.title, { textAlign: 'center', color: colors.primary }]}>
                {userStats.predictionsCorrect}%
              </Text>
              <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
                Predictions
              </Text>
            </View>
          </View>
        </View>

        {/* Favorites */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Favorites</Text>
          <View style={commonStyles.card}>
            <View style={[commonStyles.row, { marginBottom: 12 }]}>
              <Text style={commonStyles.text}>Favorite Team:</Text>
              <Text style={[commonStyles.text, { fontWeight: '600', color: colors.primary }]}>
                {userStats.favoriteTeam}
              </Text>
            </View>
            <View style={commonStyles.row}>
              <Text style={commonStyles.text}>Favorite Driver:</Text>
              <Text style={[commonStyles.text, { fontWeight: '600', color: colors.primary }]}>
                {userStats.favoriteDriver}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Menu */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Settings</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={commonStyles.card}
              onPress={() => handleMenuPress(item)}
            >
              <View style={commonStyles.row}>
                <Icon name={item.icon} size={24} style={{ color: colors.text, marginRight: 16 }} />
                <Text style={[commonStyles.text, { flex: 1 }]}>
                  {item.title}
                </Text>
                <Icon name="chevron-forward" size={20} style={{ color: colors.grey }} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <View style={[commonStyles.section, { paddingBottom: 32 }]}>
          <Button
            text="Sign Out"
            onPress={handleSignOut}
            style={{
              backgroundColor: colors.backgroundAlt,
              borderWidth: 1,
              borderColor: colors.primary,
            }}
            textStyle={{ color: colors.primary }}
          />
        </View>
      </ScrollView>
    </View>
  );
}