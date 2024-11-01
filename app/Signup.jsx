import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, ScrollView, ToastAndroid, ActivityIndicator,Platform } from 'react-native';
import React, { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/authContext';
import { useFonts } from 'expo-font';

export default function Signup() {
  const router = useRouter();
  const usernameRef = useRef("");
  const emailRef = useRef("");
  const phoneRef = useRef("");
  const passwordRef = useRef("");
  const rapidpassRef = useRef("");
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!usernameRef.current || !emailRef.current || !phoneRef.current || !passwordRef.current || !rapidpassRef.current) {
      ToastAndroid.show("Please fill all the fields", ToastAndroid.SHORT);
      return;
    }

    setLoading(true);
    let response = await register(emailRef.current, passwordRef.current, usernameRef.current, phoneRef.current, rapidpassRef.current);
    setLoading(false);

    if (response.success) {
      ToastAndroid.show("Registration successful!", ToastAndroid.SHORT);
      router.push('/Home');
    } else {
      ToastAndroid.show(response.msg || "Something went wrong", ToastAndroid.SHORT);
    }
  };

  let [fontsLoaded] = useFonts({
    'poppins-regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'poppins-semibold': require('../assets/fonts/Poppins-SemiBold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Top Wave Design */}
        <View style={styles.waveContainer}>
          <Image source={require('../assets/images/metrologo1.png')} style={styles.logo} />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Create New Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              onChangeText={value => usernameRef.current = value}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              onChangeText={value => emailRef.current = value}
            />
            <TextInput
              style={styles.input}
              placeholder="Mobile No."
              keyboardType="phone-pad"
              onChangeText={value => phoneRef.current = value}
            />
             <TextInput
              style={styles.input}
              placeholder="Rapid Pass No."
              keyboardType="phone-pad"
              onChangeText={value => rapidpassRef.current = value}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              onChangeText={value => passwordRef.current = value}
            />
          </View>

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/Signin')}>
              <Text style={styles.signupLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  waveContainer: {
    height: 240,
    backgroundColor: 'teal',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontFamily: 'poppins-semibold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    fontFamily: 'poppins-regular',
  },
  inputContainer: {
    gap: 20,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 15,
    color: '#333',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#666',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'poppins-semibold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  signupText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'poppins-regular',
  },
  signupLink: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'poppins-semibold',
  },
});
