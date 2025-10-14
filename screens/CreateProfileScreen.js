import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your backend API endpoint
const API_BASE = "https://nearyala.lk";

export default function CreateProfileScreen({ route, navigation, setUser }) {
  // 1. Receive the googleUser object passed from the LoginScreen
  const { googleUser } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Pre-fill data from Google Sign-In
    email: googleUser?.email || '',
    username: googleUser?.name || '',
    
    // Fields for the user to fill in
    address: '',
    date_of_birth: '',
    id_number: '',
    job: '',
    password: '',
    
    // These might be set by your backend, send empty strings
    card_uid: '',
    user_uid: '',
  });

  // A single handler for all text inputs
  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.address || !formData.date_of_birth || !formData.id_number || !formData.job || !formData.password) {
      Alert.alert('Missing Information', 'Please fill out all required fields.');
      return;
    }
    
    setLoading(true);
    try {
      const url = `${API_BASE}/api/v1/user`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const contentType = response.headers.get("content-type") || "";

      if (response.ok) {
        if (contentType.includes("application/json")) {
          const newUser = await response.json();
          // The API should return the complete user object after creation
          await AsyncStorage.setItem('user', JSON.stringify(newUser.data));
          setUser(newUser.data);
          navigation.replace('Dashboard');
        } else {
          throw new Error("Server returned an unexpected response format.");
        }
      } else {
        // Handle API errors
        let errorMsg = 'Failed to create profile. Please try again.';
        if (contentType.includes("application/json")) {
          const error = await response.json();
          errorMsg = error.detail || errorMsg;
        }
        Alert.alert('Registration Error', errorMsg);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Network Error', 'Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>
          We need a few more details to finish setting up your account.
        </Text>

        {/* --- READ-ONLY FIELDS --- */}
        <Text style={styles.label}>Email (from Google)</Text>
        <TextInput
          style={styles.inputDisabled}
          value={formData.email}
          editable={false}
        />

        <Text style={styles.label}>Username (from Google)</Text>
        <TextInput
          style={styles.inputDisabled}
          value={formData.username}
          editable={false}
        />
        
        {/* --- USER-EDITABLE FIELDS --- */}
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your address"
          value={formData.address}
          onChangeText={(text) => handleChange('address', text)}
        />

        <Text style={styles.label}>Date of Birth</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={formData.date_of_birth}
          onChangeText={(text) => handleChange('date_of_birth', text)}
        />

        <Text style={styles.label}>ID Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your ID number"
          value={formData.id_number}
          onChangeText={(text) => handleChange('id_number', text)}
        />

        <Text style={styles.label}>Job</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your job title"
          value={formData.job}
          onChangeText={(text) => handleChange('job', text)}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Create a password"
          value={formData.password}
          onChangeText={(text) => handleChange('password', text)}
          secureTextEntry // Hides password input
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSubmit} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit Profile</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// React Native StyleSheet for styling
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F0F4F8',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 24,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputDisabled: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    fontSize: 16,
    color: '#6b7280',
  },
  button: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});