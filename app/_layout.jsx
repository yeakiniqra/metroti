import { View, Text } from 'react-native'
import { Slot,Stack, useSegments,useRouter } from 'expo-router'
import { AuthContextProvider, useAuth } from '../context/authContext'
import { useEffect,useState } from 'react'



const MainLayout = () => {
  const {isAuthenticated} = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Redirect to /signin if not authenticated


    if ( typeof isAuthenticated === 'undefined') return;
    const inApp = segments[0] === '(app)';
    if ( isAuthenticated && !inApp) {
       // Redirect to /app
        router.replace('/Home');

    } else if (isAuthenticated == false) {
        // Redirect to /signin
        router.replace('/Signin');

    }


  }, [isAuthenticated])


  return <Slot />
}



export default function RootLayout() {
  return (
    <AuthContextProvider>
       <MainLayout />
    </AuthContextProvider>
  )
}