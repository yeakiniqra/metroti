import { Tabs } from 'expo-router';
import { FontAwesome5, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useEffect } from 'react';
import { useNavigation } from 'expo-router';

export default function TabLayout() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'green',
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: 'white',
          position: 'absolute',
          paddingHorizontal: 5,
          paddingVertical: 8,
          paddingBottom: 8,
          height: 60,
          justifyContent: 'center',
          alignSelf: 'center',
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="home" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Ticket"
        options={{
          title: 'Tickets',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="ticket" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Journey"
        options={{
          title: 'Journey',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Feather name="map" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="user-alt" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}