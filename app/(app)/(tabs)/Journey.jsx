import { View, Text, Platform, ScrollView, SafeAreaView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/authContext';
import { db } from '../../../firebaseConfig';
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFonts } from 'expo-font';

export default function Journey() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const ticketsRef = collection(db, 'tickets');
      const q = query(ticketsRef, where('userId', '==', user.userId));
      const querySnapshot = await getDocs(q);
      
      const ticketData = [];
      querySnapshot.forEach((doc) => {
        ticketData.push({ id: doc.id, ...doc.data() });
      });
      
      setTickets(ticketData);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'running':
        return '#FF9B57';
      case 'complete':
        return '#4CAF50';
      case 'cancel':
        return '#FF4081';
      default:
        return '#000000';
    }
  };

  const getActionButton = (status) => {
    switch (status.toLowerCase()) {
      case 'running':
        return { text: 'Details', color: '#FF9B57' };
      case 'complete':
        return { text: 'Book Again', color: '#4CAF50' };
      case 'cancel':
        return { text: 'Try Again', color: '#FF4081' };
      default:
        return { text: '', color: '#000000' };
    }
  };

  const handleActionPress = (ticket) => {
    // Handle different actions based on status
    switch (ticket.status.toLowerCase()) {
      case 'running':
        // Navigate to details
        break;
      case 'complete':
        // Navigate to booking
        break;
      case 'cancel':
        // Navigate to booking
        break;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  let [fontsLoaded] = useFonts({
    'poppins-regular': require('../../../assets/fonts/Poppins-Regular.ttf'),
    'poppins-semibold': require('../../../assets/fonts/Poppins-SemiBold.ttf'),

  })

  if (!fontsLoaded) {
    return null
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Journey History</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {tickets.map((ticket) => (
          <View key={ticket.id} style={styles.ticketCard}>
            <View style={styles.routeContainer}>
              <View style={styles.locationContainer}>
                <View style={styles.locationInfo}>
                  <Ionicons name="location-outline" size={20} color="#666" />
                  <Text style={styles.locationText}>{ticket.startStation}</Text>
                </View>
                <View style={styles.arrow}>
                  <Ionicons name="arrow-forward" size={20} color="#666" />
                </View>
                <View style={styles.locationInfo}>
                  <Ionicons name="location-outline" size={20} color="#666" />
                  <Text style={styles.locationText}>{ticket.destinationStation}</Text>
                </View>
              </View>
              
              <View style={styles.detailsContainer}>
                <View style={styles.leftDetails}>
                  <Text style={styles.dateText}>Date: {formatDate(ticket.date)}</Text>
                  <Text style={styles.personsText}>Traveller: {ticket.numPersons} person</Text>
                  <Text style={styles.fareText}>BDT: {ticket.fare}.00</Text>
                </View>
                
                <View style={styles.rightDetails}>
                  <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                    {ticket.status}
                  </Text>
                  
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: getActionButton(ticket.status).color }
                    ]}
                    onPress={() => handleActionPress(ticket)}
                  >
                    <Text style={styles.actionButtonText}>
                      {getActionButton(ticket.status).text}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: Platform.OS === 'android' ? 25 : 0
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10
  },
  headerTitle: {
    fontSize: 24,
    color: '#333',
    fontFamily : 'poppins-semibold'
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eee'
  },
  routeContainer: {
    gap: 15
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    fontFamily : 'poppins-semibold'
  },
  arrow: {
    paddingHorizontal: 10
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  leftDetails: {
    gap: 5
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    fontFamily : 'poppins-regular'
  },
  personsText: {
    fontSize: 14,
    color: '#666',
    fontFamily : 'poppins-regular'
  },
  fareText: {
    fontSize: 14,
    color: '#666',
    fontFamily : 'poppins-regular'
  },
  rightDetails: {
    alignItems: 'flex-end',
    gap: 8
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily : 'poppins-semibold'
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    fontFamily : 'poppins-semibold'
  }
});