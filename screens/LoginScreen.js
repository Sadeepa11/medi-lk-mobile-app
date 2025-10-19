import React, { useState, useEffect } from 'react';
import { View, Pressable, Image, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// Your backend API endpoint
const API_BASE = "https://nearyala.lk";

export default function LoginScreen({ navigation, setUser }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user already exists in AsyncStorage (no changes here)
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const userInfo = JSON.parse(storedUser);
          setUser(userInfo); // Update global state
          navigation.replace('Home');
        }
      } catch (e) {
        console.log('Error checking stored user:', e);
      }
    };
    checkLogin();
  }, [navigation, setUser]);

  // ✅ Updated login handler with API logic
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Sign in with Google
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const googleUserInfo = response.data.user;

      if (!googleUserInfo || !googleUserInfo.email) {
        throw new Error('Could not retrieve Google user information.');
      }
      
      console.log('✅ Google sign-in successful:', googleUserInfo.email);

      // 2. Call your backend API to check if the user exists
      const url = `${API_BASE}/api/v1/user?email=${googleUserInfo.email}`;
      const apiResponse = await fetch(url, { headers: { accept: "application/json" } });
      
      console.log('📡 API Response Status:', apiResponse.status);

      // 3. Handle API Response
      if (apiResponse.status === 200) {
        // --- USER EXISTS ---
        const data = await apiResponse.json();
        const existingUser = data.data;
        
        if (!existingUser || !existingUser.user_uid) {
          throw new Error('API returned incomplete user data.');
        }

        // Merge backend data with Google data
        const finalUser = {
          ...existingUser, // Data from your API (like user_uid)
          name: googleUserInfo.name,
          email: googleUserInfo.email,
          photo: googleUserInfo.photo, // Use 'photo' from google-signin
        };
        
        console.log('👤 Existing user found. Final object:', finalUser);

        await AsyncStorage.setItem('user', JSON.stringify(finalUser));
        setUser(finalUser);
        navigation.replace('Home');

      } else if (apiResponse.status === 404) {
        // --- NEW USER ---
        console.log('👤 New user detected. Navigating to profile creation.');

        // Navigate to a profile creation screen.
        // You will need to create this 'CreateProfile' screen in your navigator.
        navigation.replace('CreateProfile', { googleUser: googleUserInfo });
        
      } else {
        // --- OTHER API ERROR ---
        throw new Error(`Server error: Received status ${apiResponse.status}`);
      }

    } catch (err) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) setError('Sign in cancelled');
      else if (err.code === statusCodes.IN_PROGRESS) setError('Sign in in progress');
      else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) setError('Play Services not available');
      else setError(err.message || 'An unknown error occurred'); // Show API or other errors
      console.log('Error during login process:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image source={require('../assets/logo.jpeg')} style={styles.logo} />
          <Text style={styles.appName}>MediLK</Text>
          <Text style={styles.tagline}>Track your health, stay informed</Text>
        </View>

        {/* Login Section */}
        <View style={styles.loginSection}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue to your account</Text>

          <Pressable
            style={({ pressed }) => [styles.googleButton, pressed && styles.googleButtonPressed]}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <View style={styles.googleIconContainer}>
              <Image source={require('../assets/google-icon.png')} style={styles.googleIcon} />
            </View>
            <Text style={styles.googleButtonText}>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Text>
          </Pressable>

          {loading && <ActivityIndicator size="large" color="#4285F4" style={styles.loader} />}

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : null}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </View>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  content: { flex: 1, justifyContent: 'space-between', paddingVertical: 60, paddingHorizontal: 30 },
  logoContainer: { alignItems: 'center', marginTop: 20 },
  logo: { width: 120, height: 120, borderRadius: 30, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  appName: { fontSize: 36, fontWeight: '800', color: '#1a1a1a', marginBottom: 8, letterSpacing: -0.5 },
  tagline: { fontSize: 16, color: '#666', fontWeight: '400' },
  loginSection: { alignItems: 'center', marginVertical: 20 },
  welcomeText: { fontSize: 28, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 40, textAlign: 'center' },
  googleButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12, width: '100%', maxWidth: 320, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: '#E0E0E0' },
  googleButtonPressed: { backgroundColor: '#F8F9FA', transform: [{ scale: 0.98 }] },
  googleIconContainer: { width: 24, height: 24, marginRight: 16 },
  googleIcon: { width: 24, height: 24 },
  googleButtonText: { color: '#3C4043', fontSize: 16, fontWeight: '600', flex: 1, textAlign: 'center' },
  loader: { marginTop: 20 },
  errorContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFEBEE', padding: 12, borderRadius: 10, marginTop: 20, maxWidth: 320, borderLeftWidth: 4, borderLeftColor: '#F44336' },
  errorIcon: { fontSize: 18, marginRight: 8 },
  error: { color: '#C62828', fontSize: 14, fontWeight: '500', flex: 1 },
  footer: { alignItems: 'center', paddingHorizontal: 20 },
  footerText: { fontSize: 12, color: '#999', textAlign: 'center', lineHeight: 18 },
});