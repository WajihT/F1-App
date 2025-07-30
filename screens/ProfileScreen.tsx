import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Image, Modal, Switch, Platform } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from '../components/Icon';
import Button from '../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useRef } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import TireIcon from "../assets/TireIcon";
import { Animated } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  RedBullLogo,
  FerrariLogo,
  MercedesLogo,
  McLarenLogo,
  AstonMartinLogo,
  AlpineLogo,
  WilliamsLogo,
  RacingBullsLogo,
  KickSauberLogo,
  HaasLogo
} from '../assets/team-logos';


const defaultUserStats = {
  name: 'F1 Fan',
  favoriteTeam: 'Scuderia Ferrari',
  favoriteDriver: 'Lewis Hamilton',
  racesWatched: 100,
  predictionsCorrect: 89,
  memberSince: 'March 2021',
  profilePicIndex: 0,
  customProfilePic: null as string | null,
  notifications: true,
  raceReminders: true,
};

const f1Teams = [
  { name: 'Red Bull Racing', color: '#1E3A96', backgroundColor: '#3B4CCA20', LogoComponent: RedBullLogo },
  { name: 'Scuderia Ferrari', color: '#DC0000', backgroundColor: '#DC000020', LogoComponent: FerrariLogo },
  { name: 'Mercedes-AMG', color: '#00D2BE', backgroundColor: '#00D2BE20', LogoComponent: MercedesLogo },
  { name: 'McLaren', color: '#FF8700', backgroundColor: '#FF870020', LogoComponent: McLarenLogo },
  { name: 'Aston Martin', color: '#006F62', backgroundColor: '#006F6220', LogoComponent: AstonMartinLogo },
  { name: 'Alpine', color: '#0090FF', backgroundColor: '#0090FF20', LogoComponent: AlpineLogo },
  { name: 'Williams', color: '#005AFF', backgroundColor: '#005AFF20', LogoComponent: WilliamsLogo },
  { name: 'Racing Bulls', color: '#6692FF', backgroundColor: '#6692FF20', LogoComponent: RacingBullsLogo },
  { name: 'Kick Sauber', color: '#52E252', backgroundColor: '#52E25220', LogoComponent: KickSauberLogo },
  { name: 'Haas', color: '#B6BABD', backgroundColor: '#B6BABD20', LogoComponent: HaasLogo },
];

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
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'notifications' | 'teams' | 'reminders' | 'privacy' | 'about'>('notifications');

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadStats();
    // Pulse animation for tire icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
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
    switch (item.id) {
      case 1: // Notifications
        setModalType('notifications');
        setModalVisible(true);
        break;
      case 2: // Favorite Teams
        setModalType('teams');
        setModalVisible(true);
        break;
      case 3: // Race Reminders
        setModalType('reminders');
        setModalVisible(true);
        break;
      case 4: // Data & Privacy
        setModalType('privacy');
        setModalVisible(true);
        break;
      case 5: // About
        setModalType('about');
        setModalVisible(true);
        break;
    }
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload a profile picture!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setEditedStats({ ...editedStats, customProfilePic: result.assets[0].uri });
    }
  };

  const handleTeamSelect = (teamName: string) => {
    setUserStats({ ...userStats, favoriteTeam: teamName });
    saveStats({ ...userStats, favoriteTeam: teamName });
    setModalVisible(false);
  };

  const toggleNotifications = () => {
    const newStats = { ...userStats, notifications: !userStats.notifications };
    setUserStats(newStats);
    saveStats(newStats);
  };

  const toggleRaceReminders = () => {
    const newStats = { ...userStats, raceReminders: !userStats.raceReminders };
    setUserStats(newStats);
    saveStats(newStats);
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
  ];

  const renderModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        }}>
          <View style={{
            backgroundColor: '#141422',
            borderRadius: 20,
            padding: 24,
            margin: 20,
            maxHeight: '80%',
            width: '90%',
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            {/* Modal Header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <Text style={[commonStyles.title, { fontSize: 22, marginBottom: 0 }]}>
                {modalType === 'notifications' && 'Notifications'}
                {modalType === 'teams' && 'Favorite Teams'}
                {modalType === 'reminders' && 'Race Reminders'}
                {modalType === 'privacy' && 'Data & Privacy'}
                {modalType === 'about' && 'About F1 App'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} style={{ color: colors.text }} />
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {modalType === 'notifications' && (
                <View>
                  <Text style={[commonStyles.text, { marginBottom: 20 }]}>
                    Get notified about race results, qualifying times, and breaking F1 news.
                  </Text>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: colors.backgroundAlt,
                    padding: 16,
                    borderRadius: 12,
                  }}>
                    <Text style={commonStyles.text}>Enable Notifications</Text>
                    <Switch
                      value={userStats.notifications}
                      onValueChange={toggleNotifications}
                      trackColor={{ false: colors.grey, true: colors.primary }}
                      thumbColor={userStats.notifications ? colors.accent : colors.textSecondary}
                    />
                  </View>
                </View>
              )}

              {modalType === 'teams' && (
                <View>
                  <Text style={[commonStyles.text, { marginBottom: 20 }]}>
                    Select your favorite F1 team to personalize your experience.
                  </Text>
                  {f1Teams.map((team, index) => {
                    const { LogoComponent } = team;
                    return (
                      <TouchableOpacity
                        key={index}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 16,
                          marginBottom: 8,
                          backgroundColor: userStats.favoriteTeam === team.name ? team.backgroundColor : '#202534ff',
                          borderRadius: 12,
                          borderWidth: userStats.favoriteTeam === team.name ? 2 : 1,
                          borderColor: userStats.favoriteTeam === team.name ? team.color : colors.border,
                        }}
                        onPress={() => handleTeamSelect(team.name)}
                      >
                        <View style={{ marginRight: 12, width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
                          <LogoComponent width={28} height={28} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[commonStyles.text, { fontWeight: '600' }]}>{team.name}</Text>
                        </View>
                        <View style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          backgroundColor: team.color,
                          marginLeft: 8,
                        }} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {modalType === 'reminders' && (
                <View>
                  <Text style={[commonStyles.text, { marginBottom: 20 }]}>
                    Get reminded before race weekends start and qualifying sessions begin.
                  </Text>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: colors.backgroundAlt,
                    padding: 16,
                    borderRadius: 12,
                  }}>
                    <Text style={commonStyles.text}>Enable Race Reminders</Text>
                    <Switch
                      value={userStats.raceReminders}
                      onValueChange={toggleRaceReminders}
                      trackColor={{ false: colors.grey, true: colors.primary }}
                      thumbColor={userStats.raceReminders ? colors.accent : colors.textSecondary}
                    />
                  </View>
                </View>
              )}

              {modalType === 'privacy' && (
                <View>
                  <Text style={[commonStyles.text, { lineHeight: 24 }]}>
                    Your privacy is important to us. All profile data, including your name, favorite teams, 
                    statistics, and preferences are stored locally on your device only. 
                    
                    We do not collect, store, or share any personal information with third parties. 
                    Your data never leaves your device and you have full control over it.
                    
                    Race data and statistics are fetched from public F1 APIs and are not associated 
                    with your personal information in any way.
                  </Text>
                </View>
              )}

              {modalType === 'about' && (
                <View>
                  <Text style={[commonStyles.text, { lineHeight: 24, marginBottom: 16 }]}>
                    F1 App is your ultimate companion for Formula 1 racing. Track live standings, 
                    view race calendars, analyze telemetry data, and stay up to date with the latest 
                    from the world of Formula 1.
                  </Text>
                  <Text style={[commonStyles.text, { lineHeight: 24, marginBottom: 16 }]}>
                    Features include:
                    • Live race standings and results
                    • Driver and constructor championships
                    • Race calendar with reminders
                    • Telemetry data visualization
                    • Personalized F1 experience
                  </Text>
                  <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
                    Version 1.0.0
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <LinearGradient
      colors={['#090710', '#030610', '#0c060b', '#090710']}
      locations={[0, 0.15, 0.6, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={commonStyles.container}>
        {/* Header */}
        <View style={{
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          marginTop: 5,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}>
            <View style={{ position: 'relative', marginRight: 5 }}>
              <Animated.View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 999,
                backgroundColor: 'rgba(239,68,68,0.2)',
                transform: [{ scale: pulseAnim }],
              }} />
              <TireIcon width={28} height={28} fill="#ef4444" />
            </View>
            <Text style={{
              fontWeight: 'bold',
              fontSize: 24,
              color: '#fff',
              letterSpacing: -1,
            }}>
              Profile
            </Text>
          </View>
        </View>

        <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
          {/* User Info Card */}
          <View style={commonStyles.section}>
            <View style={[commonStyles.card, { backgroundColor: colors.darkCard, borderColor: colors.border }]}>
              <View style={commonStyles.centerContent}>
                <TouchableOpacity
                  onPress={() => {
                    if (editing) {
                      Alert.alert(
                        'Profile Picture',
                        'Choose your profile picture',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Upload Photo', onPress: handleImagePicker },
                          { text: 'Use Avatar', onPress: () => {
                            const nextIndex = (editedStats.profilePicIndex + 1) % profilePics.length;
                            setEditedStats({ ...editedStats, profilePicIndex: nextIndex, customProfilePic: null });
                          }},
                        ]
                      );
                    }
                  }}
                  style={[
                    commonStyles.centerContent,
                    {
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      backgroundColor: colors.backgroundAlt,
                      marginBottom: 16,
                      overflow: 'hidden',
                      borderWidth: 3,
                      borderColor: colors.primary,
                    }
                  ]}
                >
                  <Image
                    source={
                      (editing ? editedStats.customProfilePic : userStats.customProfilePic) 
                        ? { uri: editing ? editedStats.customProfilePic! : userStats.customProfilePic! }
                        : profilePics[editing ? editedStats.profilePicIndex : userStats.profilePicIndex]
                    }
                    style={{ width: 100, height: 100 }}
                    resizeMode="cover"
                  />
                  {editing && (
                    <View style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: colors.primary,
                      borderRadius: 15,
                      width: 30,
                      height: 30,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Icon name="camera" size={16} style={{ color: colors.accent }} />
                    </View>
                  )}
                </TouchableOpacity>

                <Text style={[commonStyles.title, { color: colors.accent, textAlign: 'center', fontSize: 24 }]}>
                  {userStats.name}
                </Text>
                <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginBottom: 12 }]}>
                  Member since {userStats.memberSince}
                </Text>
                <TouchableOpacity 
                  onPress={() => setEditing(true)}
                  style={{
                    backgroundColor: colors.primary,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Icon name="create" size={16} style={{ color: colors.accent }} />
                  <Text style={{ color: colors.accent, fontWeight: '600' }}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

{editing && (
  <View style={[commonStyles.card, { marginTop: 16, backgroundColor: colors.darkCard }]}>
    <Text style={[commonStyles.subtitle, { marginBottom: 20, textAlign: 'center' }]}>Edit Profile</Text>
    
    <View style={{ marginBottom: 16 }}>
      <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>Name</Text>
      <TextInput
        style={[commonStyles.input, { 
          backgroundColor: colors.backgroundAlt,
          borderColor: colors.border,
          color: colors.text 
        }]}
        value={editedStats.name}
        onChangeText={(text) => setEditedStats({ ...editedStats, name: text })}
        placeholder="Enter your name"
        placeholderTextColor={colors.textSecondary}
      />
    </View>

    <View style={{ marginBottom: 16 }}>
      <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>Favorite Team</Text>
      <TextInput
        style={[commonStyles.input, { 
          backgroundColor: colors.backgroundAlt,
          borderColor: colors.border,
          color: colors.text 
        }]}
        value={editedStats.favoriteTeam}
        onChangeText={(text) => setEditedStats({ ...editedStats, favoriteTeam: text })}
        placeholder="Enter your favorite team"
        placeholderTextColor={colors.textSecondary}
      />
    </View>

    <View style={{ marginBottom: 16 }}>
      <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>Favorite Driver</Text>
      <TextInput
        style={[commonStyles.input, { 
          backgroundColor: colors.backgroundAlt,
          borderColor: colors.border,
          color: colors.text 
        }]}
        value={editedStats.favoriteDriver}
        onChangeText={(text) => setEditedStats({ ...editedStats, favoriteDriver: text })}
        placeholder="Enter your favorite driver"
        placeholderTextColor={colors.textSecondary}
      />
    </View>

    <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
      <View style={{ flex: 1 }}>
        <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>Races Watched</Text>
        <TextInput
          style={[commonStyles.input, { 
            backgroundColor: colors.backgroundAlt,
            borderColor: colors.border,
            color: colors.text 
          }]}
          keyboardType="numeric"
          value={String(editedStats.racesWatched)}
          onChangeText={(text) => setEditedStats({ ...editedStats, racesWatched: Number(text) || 0 })}
          placeholder="0"
          placeholderTextColor={colors.textSecondary}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>Predictions (%)</Text>
        <TextInput
          style={[commonStyles.input, { 
            backgroundColor: colors.backgroundAlt,
            borderColor: colors.border,
            color: colors.text 
          }]}
          keyboardType="numeric"
          value={String(editedStats.predictionsCorrect)}
          onChangeText={(text) => setEditedStats({ ...editedStats, predictionsCorrect: Number(text) || 0 })}
          placeholder="0"
          placeholderTextColor={colors.textSecondary}
        />
      </View>
    </View>

    <TouchableOpacity 
      onPress={() => setShowDatePicker(true)} 
      style={{
        backgroundColor: colors.backgroundAlt,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 20,
      }}
    >
      <Text style={[commonStyles.textSecondary, { marginBottom: 4 }]}>Member Since</Text>
      <Text style={[commonStyles.text, { color: colors.primary }]}>
        📅 {new Date(editedStats.memberSince).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
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
        }}
      />
    )}

    <View style={{ flexDirection: 'row', gap: 12 }}>
      <Button 
        text="Cancel" 
        onPress={() => {
          setEditing(false);
          setEditedStats(userStats);
        }}
        style={{
          flex: 1,
          backgroundColor: colors.backgroundAlt,
          borderWidth: 1,
          borderColor: colors.border,
        }}
        textStyle={{ color: colors.text }}
      />
      <Button 
        text="Save Changes" 
        onPress={() => {
          saveStats(editedStats);
          setEditing(false);
        }}
        style={{ flex: 1 }}
      />
    </View>
  </View>
)}

        {/* Stats */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>My F1 Stats</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={[commonStyles.card, { 
              flex: 1, 
              backgroundColor: colors.darkCard,
              alignItems: 'center',
              padding: 20,
            }]}>
              <Text style={[commonStyles.title, { 
                textAlign: 'center', 
                color: colors.primary, 
                fontSize: 32,
                marginBottom: 4,
              }]}>
                {userStats.racesWatched}
              </Text>
              <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
                Races Watched
              </Text>
            </View>
            <View style={[commonStyles.card, { 
              flex: 1, 
              backgroundColor: colors.darkCard,
              alignItems: 'center',
              padding: 20,
            }]}>
              <Text style={[commonStyles.title, { 
                textAlign: 'center', 
                color: colors.primary, 
                fontSize: 32,
                marginBottom: 4,
              }]}>
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
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Favorites</Text>
          <View style={[commonStyles.card, { backgroundColor: colors.darkCard }]}>
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Icon name="heart" size={20} style={{ color: colors.primary, marginRight: 8 }} />
                <Text style={[commonStyles.textSecondary]}>Favorite Team</Text>
              </View>
              <Text style={[commonStyles.text, { fontWeight: '600', color: colors.primary, fontSize: 18 }]}>
                {userStats.favoriteTeam}
              </Text>
            </View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Icon name="person" size={20} style={{ color: colors.primary, marginRight: 8 }} />
                <Text style={[commonStyles.textSecondary]}>Favorite Driver</Text>
              </View>
              <Text style={[commonStyles.text, { fontWeight: '600', color: colors.primary, fontSize: 18 }]}>
                {userStats.favoriteDriver}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Menu */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Settings</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[commonStyles.card, { 
                backgroundColor: colors.darkCard,
                marginBottom: 8,
                borderRadius: 16,
                padding: 20,
              }]}
              onPress={() => handleMenuPress(item)}
            >
              <View style={[commonStyles.row]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={{
                    backgroundColor: colors.primary + '20',
                    borderRadius: 12,
                    padding: 8,
                    marginRight: 16,
                  }}>
                    <Icon name={item.icon as any} size={20} style={{ color: colors.primary }} />
                  </View>
                  <Text style={[commonStyles.text, { fontSize: 16, fontWeight: '500' }]}>
                    {item.title}
                  </Text>
                </View>
                {item.hasSwitch ? (
                  <Switch
                    value={item.id === 1 ? userStats.notifications : userStats.raceReminders}
                    onValueChange={item.id === 1 ? toggleNotifications : toggleRaceReminders}
                    trackColor={{ false: colors.grey, true: colors.primary }}
                    thumbColor={(item.id === 1 ? userStats.notifications : userStats.raceReminders) ? colors.accent : colors.textSecondary}
                  />
                ) : (
                  <Icon name="chevron-forward" size={20} style={{ color: colors.grey }} />
                )}
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
              backgroundColor: colors.darkCard,
              borderWidth: 2,
              borderColor: colors.primary,
              paddingVertical: 16,
            }}
            textStyle={{ color: colors.primary, fontWeight: '600' }}
          />
        </View>
      </ScrollView>

      {renderModal()}
    </View>
    </LinearGradient>
  );
}
