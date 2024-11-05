import { View, Text, ActivityIndicator } from 'react-native'
import React from 'react'

export default function Loading() {
  return (
    <View className='flex-2 justify-center items-center my-20 top-10'>
      <ActivityIndicator size="large" color="green" />
    </View>
  )
}