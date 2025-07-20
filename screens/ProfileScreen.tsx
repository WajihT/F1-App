import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Image } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from '../components/Icon';
import Button from '../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useRef } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import TireIcon from "../assets/TireIcon";
import { Animated } from 'react-native';


const defaultUserStats = {
  name: 'F1 Fan',
  favoriteTeam: 'Scuderia Ferrari',
  favoriteDriver: 'Lewis Hamilton',
  racesWatched: 100,
  predictionsCorrect: 89,
  memberSince: 'March 2021',
  profilePicIndex: 0,
};

const menuItems = [
  { id: 1, title: 'Notifications', icon: 'notifications', hasSwitch: true },
  { id: 2, title: 'Favorite Teams', icon: 'heart', hasSwitch: false },
  { id: 3, title: 'Race Reminders', icon: 'alarm', hasSwitch: true },
  { id: 4, title: 'Data & Privacy', icon: 'shield-checkmark', hasSwitch: false },
  { id: 5, title: 'About', icon: 'information-circle', hasSwitch: false },
];

export default function ProfileScreen() {
  const [userStats, setUserStats] = useState(defaultUserStats);
  const [editing, setEditing] = useState(false);
  const [editedStats, setEditedStats] = useState(defaultUserStats);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const savedStats = await AsyncStorage.getItem('userStats');
      if (savedStats) {
        setUserStats(JSON.parse(savedStats));
        setEditedStats(JSON.parse(savedStats));
      }
    } catch (e) {
      console.error('Failed to load stats', e);
    }
  };

  const saveStats = async (newStats: typeof defaultUserStats) => {
    try {
      await AsyncStorage.setItem('userStats', JSON.stringify(newStats));
      setUserStats(newStats);
    } catch (e) {
      console.error('Failed to save stats', e);
    }
  };

  const handleMenuPress = (item: (typeof menuItems)[0]) => {
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

  const profilePics = [
  require('../assets/profile-pics/avatar1.png'),
  require('../assets/profile-pics/avatar2.png'),
  require('../assets/profile-pics/avatar3.png'),
  ]

  return (
<LinearGradient
      colors={['#090710', '#030610', '#0c060b', '#090710']}
      locations={[0, 0.15, 0.6, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
    <View style={commonStyles.container}>
      <View
  style={{
    alignItems: 'center',        // 🔴 Center horizontally
    justifyContent: 'center',    // 🔴 Center vertically (optional)
    marginBottom: 16,
    marginTop: 5,
  }}
>
  <TouchableOpacity
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    }}
  >
    <View style={{ position: 'relative', marginRight: 5 }}>
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 999,
          backgroundColor: 'rgba(239,68,68,0.2)',
          transform: [{ scale: pulseAnim }],
        }}
      />
      <TireIcon width={28} height={28} fill="#ef4444" />
    </View>

    <Text
      style={{
        fontWeight: 'bold',
        fontSize: 24,
        color: '#fff',
        letterSpacing: -1,
      }}
    >
      <Text>Profile</Text>
    </Text>
  </TouchableOpacity>
</View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={commonStyles.section}>
          <View style={[commonStyles.card, { backgroundColor: colors.primary }]}>
            <View style={commonStyles.centerContent}>
              <TouchableOpacity
  onPress={() => {
    if (!editing) return;
    const nextIndex = (editedStats.profilePicIndex + 1) % profilePics.length;
    setEditedStats({ ...editedStats, profilePicIndex: nextIndex });
  }}
  style={[
    commonStyles.centerContent,
    {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.accent,
      marginBottom: 16,
      overflow: 'hidden',
    }
  ]}
>
  <Image
    source={profilePics[userStats.profilePicIndex]}
    style={{ width: 80, height: 80 }}
    resizeMode="cover"
  />

  {editing && (
  <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginVertical: 12 }}>
    {profilePics.map((pic, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => setEditedStats({ ...editedStats, profilePicIndex: index })}
        style={{
          margin: 6,
          borderWidth: editedStats.profilePicIndex === index ? 2 : 0,
          borderColor: colors.primary,
          borderRadius: 40,
          overflow: 'hidden',
        }}
      >
        <Image
          source={pic}
          style={{ width: 60, height: 60 }}
          resizeMode="cover"
        />
      </TouchableOpacity>
    ))}
  </View>
)}
</TouchableOpacity>
              <Text style={[commonStyles.title, { color: colors.accent, textAlign: 'center' }]}>
                {userStats.name}
              </Text>
              <Text style={[commonStyles.textSecondary, { color: colors.accent, opacity: 0.8, textAlign: 'center' }]}>
                Member since {userStats.memberSince}
              </Text>
              <TouchableOpacity onPress={() => setEditing(true)}>
                <Text style={{ color: colors.accent, marginTop: 8 }}>✏️ Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

{editing && (
  <View style={[commonStyles.card, { marginTop: 16 }]}>
    <TextInput
      style={[commonStyles.text, { borderBottomWidth: 1, marginBottom: 8 }]}
      value={editedStats.name}
      onChangeText={(text) => setEditedStats({ ...editedStats, name: text })}
      placeholder="Name"
    />
    <TextInput
      style={[commonStyles.text, { borderBottomWidth: 1, marginBottom: 8 }]}
      value={editedStats.favoriteTeam}
      onChangeText={(text) => setEditedStats({ ...editedStats, favoriteTeam: text })}
      placeholder="Favorite Team"
    />
    <TextInput
      style={[commonStyles.text, { borderBottomWidth: 1, marginBottom: 8 }]}
      value={editedStats.favoriteDriver}
      onChangeText={(text) => setEditedStats({ ...editedStats, favoriteDriver: text })}
      placeholder="Favorite Driver"
    />
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={[commonStyles.text, { marginRight: 8 }]}>Races Watched:</Text>
              <TextInput
                style={[commonStyles.text, { borderBottomWidth: 1, flex: 1 }]}
                keyboardType="numeric"
                value={String(editedStats.racesWatched)}
                onChangeText={(text) => setEditedStats({ ...editedStats, racesWatched: Number(text) || 0 })}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={[commonStyles.text, { marginRight: 8 }]}>Predictions (%):</Text>
              <TextInput
                style={[commonStyles.text, { borderBottomWidth: 1, flex: 1 }]}
                keyboardType="numeric"
                value={String(editedStats.predictionsCorrect)}
                onChangeText={(text) => setEditedStats({ ...editedStats, predictionsCorrect: Number(text) || 0 })}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ marginBottom: 8 }}>
              <Text style={[commonStyles.text, { color: colors.primary }]}>
                📅 Edit Member Since: {new Date(editedStats.memberSince).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={new Date(editedStats.memberSince)}
                mode="date"
                display="default"
                onChange={(_, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setEditedStats({ ...editedStats, memberSince: selectedDate.toISOString().split('T')[0] });
                  }
                }}/>)}
            </View>
            <View style={commonStyles.row}>
              <Button text="Cancel" onPress={() => setEditing(false)} />
              <Button text="Save" onPress={() => {
                saveStats(editedStats);
                setEditing(false);
              }} />
            </View>
          </View>
        )}

        {/* Stats */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>My F1 Stats</Text>
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
                <Icon name={item.icon as any} size={24} style={{ color: colors.text, marginRight: 16 }} />
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
    </LinearGradient>
  );
}
