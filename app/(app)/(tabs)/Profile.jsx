import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, SafeAreaView, Platform, KeyboardAvoidingView, Image } from 'react-native';
import { useAuth } from '../../../context/authContext';
import { db, auth } from '../../../firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';

export default function Profile() {
  const { user, logout } = useAuth();
  const userEmail = auth.currentUser?.email;
  const [username, setUsername] = useState(user?.username || '');
  const [contact, setContact] = useState(user?.contact || '');
  const [address, setAddress] = useState(user?.address || '');
  const [editMode, setEditMode] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          setUsername(userData.username || '');
          setContact(userData.contact || '');
          setAddress(userData.address || '');
        } else if (user && user.userId) {
          const userDoc = doc(db, `users/${user.userId}`);
          const docSnapshot = await getDoc(userDoc);
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            setUsername(userData.username || '');
            setContact(userData.contact || '');
            setAddress(userData.address || '');
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [user]);

  const handleEditToggle = async () => {
    if (editMode) {
      try {
        if (user && user.userId) {
          const userDoc = doc(db, `users/${user.userId}`);
          const updatedData = { username, contact, address };
          await updateDoc(userDoc, updatedData);
          await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
          Alert.alert('Success', 'Profile updated successfully!');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
        console.error('Error updating document:', error);
      }
    }
    setEditMode(!editMode);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple logout attempts
    
    try {
      setIsLoggingOut(true);
      const response = await logout();
      
      if (response.success) {
        await AsyncStorage.clear(); // Clear all storage instead of just userData
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert(
        'Error',
        'Failed to log out. Please try again.',
        [{ text: 'OK' }],
        { cancelable: false }
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  let [fontsLoaded] = useFonts({
    'poppins-regular': require('../../../assets/fonts/Poppins-Regular.ttf'),
    'poppins-semibold': require('../../../assets/fonts/Poppins-SemiBold.ttf'),

  })

  if (!fontsLoaded) {
    return null
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>{username}'s Profile</Text>
          </View>
          <View style={styles.profilePictureContainer}>
            <Image source={require('../../../assets/images/default.png')} style={styles.profilePicture} />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.input, { color: 'gray' }]}
              value={username}
              editable={false}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, { color: 'gray' }]}
              value={userEmail}
              editable={false}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              editable={editMode}
              value={contact}
              onChangeText={setContact}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              editable={editMode}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your address"
            />
          </View>
          <TouchableOpacity style={[styles.button, { backgroundColor: editMode ? 'blue' : 'teal' }]} onPress={handleEditToggle}>
            <Text style={styles.buttonText}>{editMode ? 'Save Changes' : 'Edit Profile'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="white" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: 'poppins-semibold',
    textAlign: 'center',
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: '#ccc',
    borderWidth: 2,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'poppins-semibold',
    marginBottom: 5,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'poppins-semibold',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'red',
    marginTop: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    marginLeft: 8,
  },
});
