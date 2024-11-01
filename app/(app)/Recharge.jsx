import { View, Text, Platform, SafeAreaView, ScrollView, StyleSheet, ToastAndroid, TouchableOpacity, Modal, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/authContext'
import { Ionicons } from '@expo/vector-icons'
import { db } from '../../firebaseConfig'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { useFonts } from 'expo-font'

export default function Recharge() {
    const { user } = useAuth()
    const [balance, setBalance] = useState(0)
    const [rapidPass, setRapidPass] = useState('')
    const [modalVisible, setModalVisible] = useState(false)
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchUserData()
    }, [])

    const fetchUserData = async () => {
        try {
            const userDoc = await getDoc(doc(db, 'users', user.userId))
            if (userDoc.exists()) {
                setBalance(userDoc.data().balance || 0)
                setRapidPass(userDoc.data().rapidpass || '')
            }
        } catch (error) {
            console.error('Error fetching user data:', error)
            showToast('Failed to fetch user data')
        }
    }

    const handleRecharge = async () => {
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            showToast('Please enter a valid amount')
            return
        }

        setLoading(true)
        try {
            const newBalance = balance + parseFloat(amount)
            await updateDoc(doc(db, 'users', user.userId), {
                balance: newBalance
            })
            setBalance(newBalance)
            setModalVisible(false)
            setAmount('')
            showToast('Recharge successful!')
        } catch (error) {
            console.error('Error recharging:', error)
            showToast('Recharge failed')
        }
        setLoading(false)
    }

    const showToast = (message) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT)
        }
    }

    const predefinedAmounts = [100, 200, 500, 1000]

    let [fontsLoaded] = useFonts({
        'poppins-regular': require('../../assets/fonts/Poppins-Regular.ttf'),
        'poppins-semibold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
    })

    if (!fontsLoaded) {
        return null
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                {/* Metro Card Section */}
                <View style={styles.cardContainer}>
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Dhaka Metro Rapid Pass</Text>
                            <Ionicons name="subway-outline" size={24} color="#fff" />
                        </View>
                        <Text style={styles.cardNumber}>{rapidPass}</Text>
                        <View style={styles.balanceContainer}>
                            <Text style={styles.balanceLabel}>Available Balance</Text>
                            <Text style={styles.balanceAmount}>BDT {balance.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                {/* Quick Recharge Options */}
                <View style={styles.quickRechargeContainer}>
                    <Text style={styles.sectionTitle}>Quick Recharge</Text>
                    <View style={styles.amountGrid}>
                        {predefinedAmounts.map((predefinedAmount) => (
                            <TouchableOpacity
                                key={predefinedAmount}
                                style={styles.amountButton}
                                onPress={() => {
                                    setAmount(predefinedAmount.toString())
                                    setModalVisible(true)
                                }}
                            >
                                <Text style={styles.amountButtonText}>BDT {predefinedAmount}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Custom Recharge Button */}
                <TouchableOpacity
                    style={styles.customRechargeButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="add-circle-outline" size={24} color="#fff" />
                    <Text style={styles.customRechargeText}>Custom Recharge</Text>
                </TouchableOpacity>

                {/* Recharge Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Recharge Amount</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter amount"
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                            />
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.rechargeButton]}
                                    onPress={handleRecharge}
                                    disabled={loading}
                                >
                                    <Text style={styles.buttonText}>
                                        {loading ? 'Processing...' : 'Recharge'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    cardContainer: {
        padding: 20,
    },
    card: {
        backgroundColor: 'teal',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'poppins-semibold',
    },
    cardNumber: {
        color: '#fff',
        fontSize: 16,
        letterSpacing: 2,
        marginBottom: 20,
    },
    balanceContainer: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.3)',
        paddingTop: 15,
    },
    balanceLabel: {
        color: '#fff',
        fontSize: 14,
        opacity: 0.8,
    },
    balanceAmount: {
        color: '#fff',
        fontSize: 24,
        fontFamily: 'poppins-semibold',
        marginTop: 5,
    },
    quickRechargeContainer: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'poppins-semibold',
        marginBottom: 15,
        color: '#333',
    },
    amountGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    amountButton: {
        width: '48%',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    amountButtonText: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'poppins-semibold',
    },
    customRechargeButton: {
        backgroundColor: 'green',
        marginHorizontal: 20,
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    customRechargeText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'poppins-semibold',
        marginLeft: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'poppins-semibold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        width: '48%',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f44336',
    },
    rechargeButton: {
        backgroundColor: '#2962ff',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'poppins-semibold',
    },
})