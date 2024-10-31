import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Modal, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebaseConfig';
import { collection, addDoc } from "firebase/firestore";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import ViewShot from "react-native-view-shot";
import { useFonts } from 'expo-font';
import { useAuth } from '../../context/authContext';

export default function Checkout() {
    const { startStation, destinationStation, selectedDate, numPersons, fare } = useLocalSearchParams();
    const router = useRouter();
    const viewShotRef = React.useRef();
    const { user } = useAuth();

    // State for Card Information
    const [cardNumber, setCardNumber] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const handleDownloadTicket = async () => {
        try {
            const uri = await viewShotRef.current.capture();
            const filename = `ticket-${Date.now()}.jpg`;
            const downloadPath = `${FileSystem.documentDirectory}${filename}`;

            await FileSystem.moveAsync({
                from: uri,
                to: downloadPath
            });

            await Sharing.shareAsync(downloadPath);
        } catch (error) {
            Alert.alert("Error", "Failed to download ticket.");
            console.error("Error downloading ticket: ", error);
        }
    };

    const handleCheckout = async () => {
        if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
            Alert.alert("Incomplete Information", "Please fill in all card details.");
            return;
        }

        if (!user || !user.userId) {
            Alert.alert("Error", "User not authenticated.");
            return;
        }

        try {
            const ticketData = {
                userId: user.userId, // Add user ID to ticket data
                startStation,
                destinationStation,
                selectedDate,
                numPersons,
                fare,
                cardHolder,
                status: 'Running', // Add initial status
                createdAt: new Date().toISOString(),
                date: selectedDate // For consistency with history view
            };

            await addDoc(collection(db, "tickets"), ticketData);
            setModalVisible(true);
        } catch (error) {
            Alert.alert("Error", "Failed to save ticket information.");
            console.error("Error saving document: ", error);
        }
    };

    let [fontsLoaded] = useFonts({
        'poppins-regular': require('../../assets/fonts/Poppins-Regular.ttf'),
        'poppins-semibold': require('../../assets/fonts/Poppins-SemiBold.ttf'),

    })

    if (!fontsLoaded) {
        return null
    }


    const TicketCard = () => (
        <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }}>
            <View style={styles.ticketCard}>
                <View style={styles.ticketHeader}>
                    <View style={styles.routeInfo}>
                        <View style={styles.stationInfo}>
                            <Text style={styles.label}>From</Text>
                            <Text style={styles.stationText}>{startStation}</Text>
                        </View>
                        <View style={styles.stationInfo}>
                            <Text style={styles.label}>To</Text>
                            <Text style={styles.stationText}>{destinationStation}</Text>
                        </View>
                    </View>
                    <View style={styles.qrContainer}>
                        <QRCode
                            value={`From: ${startStation}, To: ${destinationStation}, Date: ${selectedDate}, Persons: ${numPersons}, Fare: ${fare} BDT`}
                            size={80}
                        />
                    </View>
                </View>

                <View style={styles.ticketDetails}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Booking ticket</Text>
                        <Text style={styles.detailValue}>{numPersons} person</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Booking time</Text>
                        <Text style={styles.detailValue}>{new Date(selectedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        <Text style={styles.detailValue}>{new Date(selectedDate).toLocaleDateString()}</Text>
                    </View>
                    <View style={[styles.detailRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalAmount}>BDT: {fare}</Text>
                    </View>
                </View>
            </View>
        </ViewShot>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'padding' : 'height'} style={styles.flexContainer}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={styles.header}>Confirmation</Text>
                    <TicketCard />

                    {/* Card Information Fields */}
                    <TextInput
                        style={styles.input}
                        placeholder="Card Number"
                        keyboardType="numeric"
                        value={cardNumber}
                        onChangeText={setCardNumber}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Card Holder Name"
                        value={cardHolder}
                        onChangeText={setCardHolder}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Expiry Date (MM/YY)"
                        value={expiryDate}
                        onChangeText={setExpiryDate}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="CVV"
                        keyboardType="numeric"
                        secureTextEntry
                        value={cvv}
                        onChangeText={setCvv}
                    />

                    <TouchableOpacity style={styles.button} onPress={handleCheckout}>
                        <Text style={styles.buttonText}>
                            <Ionicons name="checkmark-done-outline" size={20} /> Proceed to Payment
                        </Text>
                    </TouchableOpacity>

                    {/* Success Modal */}
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalView}>
                                <View style={styles.successIcon}>
                                    <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
                                </View>

                                <Text style={styles.modalTitle}>Ticket Purchased Successfully!</Text>

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={styles.downloadButton}
                                        onPress={handleDownloadTicket}
                                    >
                                        <Ionicons name="download-outline" size={20} color="#fff" />
                                        <Text style={styles.buttonText}>Download Ticket</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.closeButton}
                                        onPress={() => {
                                            setModalVisible(false);
                                            router.push('/Home');
                                        }}
                                    >
                                        <Ionicons name="close-outline" size={20} color="#fff" />
                                        <Text style={styles.buttonText}>Close</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    flexContainer: {
        flex: 1,
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontFamily: 'poppins-semibold',
        marginBottom: 20,
    },
    ticketCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    ticketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    routeInfo: {
        flex: 1,
    },
    stationInfo: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
        fontFamily: 'poppins-regular',
    },
    stationText: {
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'poppins-semibold',
    },
    qrContainer: {
        padding: 5,
    },
    ticketDetails: {
        padding: 15,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    detailLabel: {
        color: '#666',
        fontSize: 14,
        fontFamily: 'poppins-regular',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        fontFamily: 'poppins-semibold',
    },
    totalRow: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#f8fff8',
    },
    totalLabel: {
        fontSize: 16,
        fontFamily: 'poppins-semibold',
    },
    totalAmount: {
        fontSize: 16,
        fontFamily: 'poppins-semibold',
        color: '#00a650',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        fontFamily: 'poppins-regular',
    },
    button: {
        backgroundColor: '#007BFF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 5,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: 'poppins-semibold',
        marginLeft: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
      },
      modalView: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      },
      successIcon: {
        marginBottom: 16,
      },
      modalTitle: {
        fontSize: 20,
        fontFamily: 'poppins-semibold',
        color: '#333',
        marginBottom: 24,
        textAlign: 'center',
      },
      modalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
      },
      downloadButton: {
        flex: 1,
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      },
      closeButton: {
        flex: 1,
        backgroundColor: 'black',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      },
      buttonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '500',
        fontFamily: 'poppins-semibold',
      },
});