import { View, Text, StyleSheet, ToastAndroid, ScrollView, TouchableOpacity, Animated } from 'react-native';
import React, { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';


const scheduleNotices = [
    {
        id: 1,
        from: 'Motijheel',
        to: 'Uttara North',
        startTime: '3:50 PM',
        endTime: '9:40 PM',
        interval: '12 min on Friday',
        type: 'regular',
    },
    {
        id: 2,
        to: 'Motijheel',
        from: 'Uttara North',
        startTime: '4:00 PM',
        endTime: '10:00 PM',
        interval: '12 min on Friday',
        type: 'regular',
    },
    {
        id: 3,
        to: 'Uttara North',
        from: 'Motijheel',
        startTime: '7:10 AM',
        endTime: '11:00 PM',
        interval: '10 min on Peak Hours',
        type: 'peak',
    },
    {
        id: 4,
        to: 'Motijheel',
        from: 'Uttara North',
        startTime: '11:10 AM',
        endTime: '4:00 PM',
        interval: '12 min on Off-Peak Hours',
        type: 'off-peak',
    }
];

const importantNotices = [
    {
        id: 1,
        title: 'Schedule Change Notice',
        content: 'Due to maintenance work, metro service will be suspended between Farmgate and Shahbag stations on Sunday from 11 PM to 5 AM.',
        date: '2024-11-05',
        priority: 'high',
    },
    {
        id: 2,
        title: 'Special Service Advisory',
        content: 'Extended service hours during Eid celebrations. Trains will run until midnight from all stations.',
        date: '2024-11-10',
        priority: 'medium',
    },
    {
        id: 3,
        title: 'New Route Announcement',
        content: 'New route from Motijheel to Kamalapur will be operational from next Year. Stay tuned for more updates.',
        date: '2024-11-15',
        priority: 'low',
    }
];

export default function Notices() {
    const [selectedTab, setSelectedTab] = useState('schedule');
    const [expandedNotice, setExpandedNotice] = useState(null);
    const slideAnim = useRef(new Animated.Value(0)).current;

    const handleTabChange = (tab) => {
        setSelectedTab(tab);
        Animated.spring(slideAnim, {
            toValue: tab === 'schedule' ? 0 : 1,
            useNativeDriver: false,
        }).start();
    };

    const handleNoticePress = (id) => {
        setExpandedNotice(expandedNotice === id ? null : id);
    };

    const showToast = (message) => {
        ToastAndroid.show(message, ToastAndroid.SHORT);
    };

    let [fontsLoaded] = useFonts({
        'poppins-semibold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
        'poppins-regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    });

    if (!fontsLoaded) {
        return null;
    }

    const renderScheduleCard = (schedule) => (
        <TouchableOpacity
            key={schedule.id}
            style={styles.scheduleCard}
            onPress={() => showToast(`Schedule from ${schedule.from} to ${schedule.to}`)}
        >
            <View style={styles.scheduleHeader}>
                <Ionicons name="train-outline" size={24} color="#008000" />
                <Text style={styles.scheduleRoute}>
                    {schedule.from} → {schedule.to}
                </Text>
            </View>

            <View style={styles.scheduleDetails}>
                <View style={styles.timeContainer}>
                    <Ionicons name="time-outline" size={20} color="#666" />
                    <Text style={styles.timeText}>
                        {schedule.startTime} - {schedule.endTime}
                    </Text>
                </View>

                <View style={styles.intervalContainer}>
                    <Ionicons name="repeat-outline" size={20} color="#666" />
                    <Text style={styles.intervalText}>Every {schedule.interval}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderNoticeCard = (notice) => (
        <TouchableOpacity
            key={notice.id}
            style={[
                styles.noticeCard,
                expandedNotice === notice.id && styles.noticeCardExpanded,
                { borderLeftColor: notice.priority === 'high' ? '#ff4444' : '#ffbb33' }
            ]}
            onPress={() => handleNoticePress(notice.id)}
        >
            <View style={styles.noticeHeader}>
                <View style={styles.noticeTitleContainer}>
                    <Ionicons
                        name={notice.priority === 'high' ? 'warning' : 'information-circle'}
                        size={24}
                        color={notice.priority === 'high' ? '#ff4444' : '#ffbb33'}
                    />
                    <Text style={styles.noticeTitle}>{notice.title}</Text>
                </View>
                <Text style={styles.noticeDate}>{notice.date}</Text>
            </View>

            {expandedNotice === notice.id && (
                <View style={styles.noticeContent}>
                    <Text style={styles.noticeText}>{notice.content}</Text>
                    <TouchableOpacity
                        style={styles.readMoreButton}
                        onPress={() => showToast('Full notice details')}
                    >
                        <Text style={styles.readMoreText}>Read More</Text>
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'schedule' && styles.activeTab]}
                    onPress={() => handleTabChange('schedule')}
                >
                    <Ionicons
                        name="time-outline"
                        size={24}
                        color={selectedTab === 'schedule' ? '#008000' : '#666'}
                    />
                    <Text style={[
                        styles.tabText,
                        selectedTab === 'schedule' && styles.activeTabText
                    ]}>
                        Schedule
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'notices' && styles.activeTab]}
                    onPress={() => handleTabChange('notices')}
                >
                    <Ionicons
                        name="notifications-outline"
                        size={24}
                        color={selectedTab === 'notices' ? '#008000' : '#666'}
                    />
                    <Text style={[
                        styles.tabText,
                        selectedTab === 'notices' && styles.activeTabText
                    ]}>
                        Notices
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Animated Indicator */}
            <Animated.View
                style={[
                    styles.tabIndicator,
                    {
                        left: slideAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '50%'],
                        }),
                    },
                ]}
            />

            {/* Content */}
            <ScrollView style={styles.content}>
                {selectedTab === 'schedule' ? (
                    <View style={styles.scheduleContainer}>
                        {scheduleNotices.map(renderScheduleCard)}
                    </View>
                ) : (
                    <View style={styles.noticesContainer}>
                        {importantNotices.map(renderNoticeCard)}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        elevation: 2,
        position: 'relative',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    activeTab: {
        backgroundColor: '#f8f8f8',
    },
    tabText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
        fontFamily: 'poppins-semibold',
    },
    activeTabText: {
        color: '#008000',
    },
    tabIndicator: {
        position: 'absolute',
        top: 52,
        width: '50%',
        height: 3,
        backgroundColor: '#008000',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    scheduleContainer: {
        gap: 16,
    },
    scheduleCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        elevation: 2,
    },
    scheduleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    scheduleRoute: {
        fontSize: 18,
        fontFamily: 'poppins-semibold',
        color: '#333',
    },
    scheduleDetails: {
        gap: 8,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    timeText: {
        fontSize: 16,
        color: '#666',
        fontFamily: 'poppins-regular',
    },
    intervalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    intervalText: {
        fontSize: 16,
        color: '#666',
        fontFamily: 'poppins-regular',
    },
    noticesContainer: {
        gap: 16,
    },
    noticeCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        borderLeftWidth: 4,
    },
    noticeCardExpanded: {
        elevation: 4,
    },
    noticeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    noticeTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    noticeTitle: {
        fontSize: 16,
        fontFamily: 'poppins-semibold',
        color: '#333',
    },
    noticeDate: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'poppins-regular',
    },
    noticeContent: {
        marginTop: 12,
        gap: 8,
    },
    noticeText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        fontFamily: 'poppins-regular',
    },
    readMoreButton: {
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    readMoreText: {
        color: '#008000',
        fontWeight: '500',
        fontFamily: 'poppins-semibold',
    },
});