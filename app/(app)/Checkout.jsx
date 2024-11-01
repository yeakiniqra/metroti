import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebaseConfig';
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
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
    
    const [modalVisible, setModalVisible] = useState(false);
    const [userBalance, setUserBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserBalance();
    }, []);

    const fetchUserBalance = async () => {
        try {
            const userDoc = await getDoc(doc(db, "users", user.userId));
            if (userDoc.exists()) {
                setUserBalance(userDoc.data().balance || 0);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching user balance:", error);
            Alert.alert("Error", "Failed to fetch your balance.");
            setLoading(false);
        }
    };

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
        if (!user || !user.userId) {
            Alert.alert("Error", "User not authenticated.");
            return;
        }

        if (userBalance < parseFloat(fare)) {
            Alert.alert(
                "Insufficient Balance",
                `Your balance (₹${userBalance}) is insufficient for this ticket (₹${fare}). Please recharge your account.`,
                [
                    {
                        text: "Recharge Now",
                        onPress: () => router.push('/Recharge')
                    },
                    {
                        text: "Cancel",
                        style: "cancel"
                    }
                ]
            );
            return;
        }

        try {
            // Update user's balance
            const newBalance = userBalance - parseFloat(fare);
            await updateDoc(doc(db, "users", user.userId), {
                balance: newBalance
            });

            // Create ticket document
            const ticketData = {
                userId: user.userId,
                startStation,
                destinationStation,
                selectedDate,
                numPersons,
                fare,
                status: 'Running',
                createdAt: new Date().toISOString(),
                date: selectedDate
            };

            await addDoc(collection(db, "tickets"), ticketData);
            setUserBalance(newBalance);
            setModalVisible(true);
        } catch (error) {
            Alert.alert("Error", "Failed to process the ticket purchase.");
            console.error("Error during checkout: ", error);
        }
    };

    let [fontsLoaded] = useFonts({
        'poppins-regular': require('../../assets/fonts/Poppins-Regular.ttf'),
        'poppins-semibold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
    });

    if (!fontsLoaded || loading) {
        return null;
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
                    <View style={[styles.detailRow, styles.balanceRow]}>
                        <Text style={styles.detailLabel}>Current Balance</Text>
                        <Text style={styles.balanceText}>BDT {userBalance.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.detailRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total Fare</Text>
                        <Text style={styles.totalAmount}>BDT {fare}</Text>
                    </View>
                    <View style={[styles.detailRow, styles.remainingRow]}>
                        <Text style={styles.detailLabel}>Remaining Balance</Text>
                        <Text style={styles.remainingText}>BDT {(userBalance - parseFloat(fare)).toFixed(2)}</Text>
                    </View>
                </View>
            </View>
        </ViewShot>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                
                <TicketCard />

                <View style={styles.warningContainer}>
                    <Ionicons name="information-circle-outline" size={24} color="#FF9800" />
                    <Text style={styles.warningText}>
                        Amount will be deducted from your Rapid Pass Card balance
                    </Text>
                </View>

                <TouchableOpacity 
                    style={[
                        styles.button,
                        userBalance < parseFloat(fare) && styles.disabledButton
                    ]} 
                    onPress={handleCheckout}
                    disabled={userBalance < parseFloat(fare)}
                >
                    <Text style={styles.buttonText}>
                        <Ionicons name="checkmark-done-outline" size={20} /> Confirm Purchase
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    header: {
        fontFamily: 'poppins-semibold',
        fontSize: 24,
        marginBottom: 20,
        color: '#333',
    },
    ticketCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    ticketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    routeInfo: {
        flex: 1,
    },
    stationInfo: {
        marginBottom: 10,
    },
    label: {
        fontFamily: 'poppins-regular',
        fontSize: 12,
        color: '#666',
    },
    stationText: {
        fontFamily: 'poppins-semibold',
        fontSize: 16,
        color: '#333',
    },
    qrContainer: {
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    ticketDetails: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    detailLabel: {
        fontFamily: 'poppins-regular',
        fontSize: 14,
        color: '#666',
    },
    detailValue: {
        fontFamily: 'poppins-regular',
        fontSize: 14,
        color: '#333',
    },
    balanceRow: {
        backgroundColor: '#f8f9fa',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    balanceText: {
        fontFamily: 'poppins-semibold',
        fontSize: 16,
        color: '#2196F3',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 12,
        marginTop: 8,
    },
    totalLabel: {
        fontFamily: 'poppins-semibold',
        fontSize: 16,
        color: '#333',
    },
    totalAmount: {
        fontFamily: 'poppins-semibold',
        fontSize: 18,
        color: '#4CAF50',
    },
    remainingRow: {
        backgroundColor: '#fff3e0',
        padding: 10,
        borderRadius: 8,
    },
    remainingText: {
        fontFamily: 'poppins-semibold',
        fontSize: 16,
        color: '#ff9800',
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
    warningText: {
        fontFamily: 'poppins-regular',
        fontSize: 14,
        color: '#F57C00',
        marginLeft: 8,
        flex: 1,
    },
    button: {
        backgroundColor: '#2196F3',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        fontFamily: 'poppins-semibold',
        color: '#fff',
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        width: '90%',
        maxWidth: 400,
    },
    successIcon: {
        marginBottom: 16,
    },
    modalTitle: {
        fontFamily: 'poppins-semibold',
        fontSize: 20,
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalBalance: {
        fontFamily: 'poppins-regular',
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    downloadButton: {
        backgroundColor: '#4CAF50',
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
        flex: 1,
        justifyContent: 'center',
    },
    closeButton: {
        backgroundColor: '#F44336',
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
        flex: 1,
        justifyContent: 'center',
    },
});