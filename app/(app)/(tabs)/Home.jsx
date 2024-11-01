import { View, Text, Platform, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { useAuth } from '../../../context/authContext'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useFonts } from 'expo-font'

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()

  let [fontsLoaded] = useFonts({
    'poppins-regular': require('../../../assets/fonts/Poppins-Regular.ttf'),
    'poppins-semibold': require('../../../assets/fonts/Poppins-SemiBold.ttf'),
  })

  if (!fontsLoaded) {
    return null
  }

  return (
    <SafeAreaView style={[styles.container, {
      paddingTop: Platform.OS === 'android' ? 30 : 0
    }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchContainer}>
          <Text style={styles.subheading}>Welcome, {user.username}</Text>
          <Text style={styles.heading}>Where are you going now?</Text>
          <View style={styles.searchBar}>
            <TextInput 
              placeholder="Search Station, Train name"
              style={styles.searchInput}
            />
            <Ionicons name="search-outline" size={20} color="#666" />
          </View>
        </View>

        <View style={styles.menuGrid}>
          <TouchableOpacity style={[styles.menuItem, { backgroundColor: '#FFE0B2' }]}
            onPress={() => router.push('/Notices')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="notifications-outline" size={24} color="#666" />
            </View>
            <Text style={styles.menuText}>Metro Notices</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: '#BBDEFB' }]}
            onPress={() => router.push('/Ticket')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="ticket-outline" size={24} color="#666" />
            </View>
            <Text style={styles.menuText}>Tickets</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: '#C8E6C9' }]}
            onPress={() => router.push('/Map')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="map-outline" size={24} color="#666" />
            </View>
            <Text style={styles.menuText}>Transport Map</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: '#FFCDD2' }]} 
            onPress={() => router.push('/Recharge')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="card-outline" size={24} color="#666" />
            </View>
            <Text style={styles.menuText}>Recharge</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.frequentSection}>
          <Text style={styles.sectionTitle}>Frequently visited station</Text>
          
          <View style={styles.journeyCard}>
            <View style={styles.journeyHeader}>
              <View style={styles.timeContainer}>
                <Text style={styles.label}>Arrival</Text>
                <Text style={styles.time}>9:30PM</Text>
              </View>
              <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Completed</Text>
              </View>
              <View style={styles.trainContainer}>
                <Text style={styles.label}>Train No.</Text>
                <Text style={styles.trainNumber}>DMR-U2</Text>
              </View>
            </View>

            <View style={styles.stationContainer}>
              <View style={styles.stationTrack}>
                <View style={styles.trackLine} />
                <View style={styles.trackDots}>
                  {[...Array(5)].map((_, i) => (
                    <View key={i} style={styles.dot} />
                  ))}
                </View>
              </View>
              <View style={styles.stationNames}>
                <Text style={styles.stationText}>Pallabi</Text>
                <Text style={styles.stationText}>Shahbagh</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  searchContainer: {
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontFamily: 'poppins-semibold',
    marginBottom: 16,
  },
  subheading: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'poppins-regular',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
  },
  searchInput: {
    flex: 1,
    marginRight: 8,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 30,
  },
  menuItem: {
    width: '45%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  iconContainer: {
    marginBottom: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'poppins-semibold',
  },
  frequentSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    fontFamily: 'poppins-semibold',
  },
  journeyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  journeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  timeContainer: {
    alignItems: 'flex-start',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 4,
  },
  statusText: {
    color: '#4CAF50',
    fontSize: 12,
    fontFamily: 'poppins-semibold',
  },
  trainContainer: {
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'poppins-regular',
  },
  time: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
  },
  trainNumber: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
  },
  stationContainer: {
    marginBottom: 24,
  },
  stationTrack: {
    height: 20,
    marginBottom: 8,
    position: 'relative',
  },
  trackLine: {
    position: 'absolute',
    top: 9,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#e0e0e0',
  },
  trackDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 5,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
  stationNames: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stationText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'poppins-semibold',
  },
  bookButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'poppins-semibold',
  },
})
