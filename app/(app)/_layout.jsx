import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

export default function _layout() {
  return (
    <Stack>
      <Stack.Screen
        name="Map"
        options={{
          headerTitle: 'Metro Map',
        }}
      />
      <Stack.Screen
        name="Checkout"
        options={{
          headerTitle: 'Ticket Confirmation',
        }}
      />
      <Stack.Screen
        name="Notices"
        options={{
          headerTitle: 'Metro Notices & Updates',
        }}
      />
      <Stack.Screen
        name="Recharge"
        options={{
          headerTitle: 'Rapid Pass Recharge',
        }}
      />
    </Stack>
  )
}