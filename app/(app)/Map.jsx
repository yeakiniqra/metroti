import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import React, { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';
import { useFonts } from 'expo-font';

const stations = [
  { id: 1, name: 'Uttara North', isTerminal: true, x: 100, y: 50 },
  { id: 2, name: 'Uttara Center', isTerminal: false, x: 100, y: 100 },
  { id: 3, name: 'Uttara South', isTerminal: false, x: 100, y: 150 },
  { id: 4, name: 'Pallabi', isTerminal: false, x: 100, y: 200 },
  { id: 5, name: 'Mirpur 11', isTerminal: false, x: 100, y: 250 },
  { id: 6, name: 'Mirpur 10', isTerminal: false, x: 100, y: 300 },
  { id: 7, name: 'Kazipara', isTerminal: false, x: 90, y: 350 },
  { id: 8, name: 'Shewrapara', isTerminal: false, x: 80, y: 400 },
  { id: 9, name: 'Agargaon', isTerminal: false, x: 90, y: 450 },
  { id: 10, name: 'Bijoy Sarani', isTerminal: false, x: 100, y: 500 },
  { id: 11, name: 'Farmgate', isTerminal: false, x: 90, y: 550 },
  { id: 12, name: 'Kawran Bazar', isTerminal: false, x: 80, y: 600 },
  { id: 13, name: 'Shahbag', isTerminal: false, x: 90, y: 650 },
  { id: 14, name: 'Dhaka University', isTerminal: false, x: 100, y: 700 },
  { id: 15, name: 'Bangladesh Secretariate', isTerminal: false, x: 120, y: 750 },
  { id: 16, name: 'Motijheel', isTerminal: true, x: 140, y: 800 },
];

export default function Map() {
  const [selectedStation, setSelectedStation] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleStationPress = (station) => {
    setSelectedStation(station);
    setIsExpanded(true);
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const generatePath = () => {
    let path = `M ${stations[0].x} ${stations[0].y}`;
    
    for (let i = 1; i < stations.length; i++) {
      const prev = stations[i - 1];
      const curr = stations[i];
      const next = stations[i + 1];

      if (i === stations.length - 1) {
        path += ` L ${curr.x} ${curr.y}`;
      } else {
        // Create curved path between stations
        const controlX = (prev.x + next.x) / 2;
        const controlY = curr.y;
        path += ` Q ${controlX} ${controlY}, ${curr.x} ${curr.y}`;
      }
    }
    return path;
  };

  let [fontsLoaded] = useFonts({
    'poppins-semibold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
    'poppins-regular': require('../../assets/fonts/Poppins-Regular.ttf'),
  });

    if (!fontsLoaded) {
        return null;
        }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.mapContainer}>
        <Svg height={850} width={300}>
          {/* Main Line Path */}
          <Path
            d={generatePath()}
            stroke="#008000"
            strokeWidth="3"
            fill="none"
          />
          
          {/* Stations */}
          {stations.map((station) => (
            <React.Fragment key={station.id}>
              <Circle
                cx={station.x}
                cy={station.y}
                r={8}
                fill={station.isTerminal ? "#008000" : "white"}
                stroke="#008000"
                strokeWidth="2"
              />
              {station.isTerminal && (
                <Circle
                  cx={station.x}
                  cy={station.y}
                  r={4}
                  fill="white"
                />
              )}
            </React.Fragment>
          ))}
        </Svg>

        {/* Station Names and Interactive Elements */}
        {stations.map((station) => (
          <TouchableOpacity
            key={station.id}
            style={[
              styles.stationButton,
              { top: station.y - 8, left: station.x + 20 }
            ]}
            onPress={() => handleStationPress(station)}
          >
            <Animated.Text
              style={[
                styles.stationName,
                selectedStation?.id === station.id && {
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              {station.name}
            </Animated.Text>
          </TouchableOpacity>
        ))}

        {/* Station Info Modal */}
        {selectedStation && isExpanded && (
          <View style={styles.stationInfo}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsExpanded(false)}
            >
              <Ionicons name="close-circle" size={24} color="#008000" />
            </TouchableOpacity>
            <Text style={styles.stationInfoTitle}>{selectedStation.name}</Text>
            <Text style={styles.stationInfoText}>
              Station Type: {selectedStation.isTerminal ? 'Terminal' : 'Regular'}
            </Text>
            {/* Add more station information here */}
            <View style={styles.stationActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="time-outline" size={20} color="#008000" />
                <Text style={styles.actionText}>Schedule</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="navigate-outline" size={20} color="#008000" />
                <Text style={styles.actionText}>Navigate</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    padding: 20,
    position: 'relative',
  },
  stationButton: {
    position: 'absolute',
    padding: 5,
  },
  stationName: {
    fontSize: 14,
    fontFamily: 'poppins-semibold',
  },
  stationInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  stationInfoTitle: {
    fontSize: 18,
    fontFamily: 'poppins-semibold',
    marginBottom: 10,
    color: '#008000',
  },
  stationInfoText: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'poppins-regular',
  },
  stationActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
  },
  actionText: {
    marginLeft: 5,
    color: '#008000',
    fontWeight: '500',
    fontFamily: 'poppins-semibold',
  },
});