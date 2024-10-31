import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ToastAndroid, Platform, TextInput, TouchableOpacity } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { db } from '../../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from "firebase/firestore"; 
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';

export default function Ticket() {
  const [stations, setStations] = useState([]);
  const [fares, setFares] = useState({});
  const [startStation, setStartStation] = useState(null);
  const [destinationStation, setDestinationStation] = useState(null);
  const [fare, setFare] = useState(null);
  const [numPersons, setNumPersons] = useState(1);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openStart, setOpenStart] = useState(false);
  const [openDest, setOpenDest] = useState(false);

  const router = useRouter();

  // Load saved state from AsyncStorage
  useEffect(() => {
    const loadSavedState = async () => {
      try {
        const savedState = await AsyncStorage.getItem('ticketBookingState');
        if (savedState) {
          const state = JSON.parse(savedState);
          setStartStation(state.startStation);
          setDestinationStation(state.destinationStation);
          setNumPersons(state.numPersons);
          setSelectedDate(new Date(state.selectedDate));
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    };
    loadSavedState();
  }, []);

  // Save state to AsyncStorage whenever it changes
  useEffect(() => {
    const saveState = async () => {
      try {
        const state = {
          startStation,
          destinationStation,
          numPersons,
          selectedDate: selectedDate.toISOString(),
        };
        await AsyncStorage.setItem('ticketBookingState', JSON.stringify(state));
      } catch (error) {
        console.error('Error saving state:', error);
      }
    };
    saveState();
  }, [startStation, destinationStation, numPersons, selectedDate]);

  // Fetch data from Firebase
  useEffect(() => {
    const fetchMetroData = async () => {
      try {
        const docRef = doc(db, "metro_fares", "metro_fare");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setStations(data.stations);
          setFares(data.fares);
        } else {
          Platform.OS === 'android' 
            ? ToastAndroid.show("No such document found!", ToastAndroid.SHORT)
            : Alert.alert("Error", "No such document found!");
        }
      } catch (error) {
        console.error("Error fetching metro data: ", error);
        Platform.OS === 'android'
          ? ToastAndroid.show("Error fetching data", ToastAndroid.SHORT)
          : Alert.alert("Error", "Error fetching data");
      }
    };
    fetchMetroData();
  }, []);

  useEffect(() => {
    if (startStation && destinationStation && fares[startStation]) {
      setFare(fares[startStation][destinationStation] * numPersons || null);
    } else {
      setFare(null);
    }
  }, [startStation, destinationStation, numPersons]);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const handleBuyNow = async () => {
    // Clear saved state before navigation
    await AsyncStorage.removeItem('ticketBookingState');
    
    router.push({
      pathname: '/Checkout',
      params: {
        startStation,
        destinationStation,
        selectedDate: selectedDate.toISOString(),
        numPersons,
        fare
      }
    });
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
      <View style={styles.content}>
        <Text style={styles.header}>
          <Ionicons name="ticket-outline" size={28} /> Book a Ticket
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>
            <Ionicons name="location-outline" size={20} /> From Station
          </Text>
          <DropDownPicker
            open={openStart}
            value={startStation}
            items={stations.map(station => ({ label: station, value: station }))}
            setOpen={setOpenStart}
            setValue={setStartStation}
            placeholder="Select Start Station"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={5000}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            <Ionicons name="navigate-outline" size={20} /> To Station
          </Text>
          <DropDownPicker
            open={openDest}
            value={destinationStation}
            items={stations.map(station => ({ label: station, value: station }))}
            setOpen={setOpenDest}
            setValue={setDestinationStation}
            placeholder="Select Destination Station"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={4000}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            <Ionicons name="calendar-outline" size={20} /> Travel Date
          </Text>
          <TouchableOpacity onPress={() => setDatePickerVisibility(true)} style={styles.dateTimeButton}>
            <Text style={styles.dateTimeText}>{formatDate(selectedDate)}</Text>
            <Ionicons name="calendar" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={(date) => {
            setSelectedDate(date);
            setDatePickerVisibility(false);
          }}
          onCancel={() => setDatePickerVisibility(false)}
        />

        <View style={styles.section}>
          <Text style={styles.label}>
            <Ionicons name="people-outline" size={20} /> Number of Persons
          </Text>
          <View style={styles.personRow}>
            <TouchableOpacity 
              onPress={() => setNumPersons(Math.max(1, numPersons - 1))}
              style={styles.personButton}
            >
              <Ionicons name="remove-circle" size={32} color="#007AFF" />
            </TouchableOpacity>
            <View style={styles.personCountContainer}>
              <Text style={styles.personCount}>{numPersons}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setNumPersons(numPersons + 1)}
              style={styles.personButton}
            >
              <Ionicons name="add-circle" size={32} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        {fare !== null && (
          <View style={styles.fareContainer}>
            <Text style={styles.fareLabel}>Total Fare</Text>
            <Text style={styles.fareAmount}>
              <Ionicons name="cash-outline" size={24} /> {fare} BDT
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={[
            styles.buyButton,
            (!startStation || !destinationStation) && styles.buyButtonDisabled
          ]}
          onPress={handleBuyNow}
          disabled={!startStation || !destinationStation}
        >
          <Ionicons name="card-outline" size={24} color="#FFF" />
          <Text style={styles.buyButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontFamily: 'poppins-semibold',
    marginBottom: 6,
    color: '#1a1a1a',
    textAlign: 'left',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'poppins-semibold',
    marginBottom: 8,
    color: '#333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdown: {
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    height: 50,
  },
  dropdownContainer: {
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'poppins-regular',
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  personButton: {
    padding: 5,
  },
  personCountContainer: {
    paddingHorizontal: 30,
  },
  personCount: {
    fontSize: 20,
    fontFamily: 'poppins-semibold',
    color: '#333',
  },
  fareContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginVertical: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fareLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
    fontFamily: 'poppins-semibold',
  },
  fareAmount: {
    fontSize: 28,
    fontFamily: 'poppins-semibold',
    color: '#007AFF',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 15,
    marginTop: 10,
  },
  buyButtonDisabled: {
    backgroundColor: '#999',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'poppins-semibold',
    marginLeft: 10,
  },
});