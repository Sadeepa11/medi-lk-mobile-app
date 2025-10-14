import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
    Platform,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from "@react-native-community/datetimepicker";

const API_BASE = "https://nearyala.lk";

export default function UpdateProfile({ route, navigation, user, setUser }) {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        address: "",
        date_of_birth: "",
        id_number: "",
        job: "",
    });
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Populate form with current user data on load
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || user.name || "",
                email: user.email || "",
                address: user.address || "",
                date_of_birth: user.date_of_birth || "",
                id_number: user.id_number || "",
                job: user.job || "",
            });
        }
    }, [user]);

    const handleChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async () => {
        if (!user || !user.user_uid) {
            Alert.alert("Error", "User not found. Please log in again.");
            return;
        }

        setLoading(true);
        try {
            const url = `${API_BASE}/api/v1/user/${user.user_uid}`;
            const response = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "accept": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Failed to update profile.");
            }

            const responseData = await response.json();
            const updatedUserData = responseData.data || responseData;
            
            const mergedUser = { ...user, ...updatedUserData };

            await AsyncStorage.setItem("user", JSON.stringify(mergedUser));
            setUser(mergedUser); // Update global state
            
            Alert.alert("Success", "Profile updated successfully!");
            navigation.goBack();

        } catch (err) {
            Alert.alert("Update Error", err.message);
        } finally {
            setLoading(false);
        }
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            handleChange('date_of_birth', selectedDate.toISOString().split('T')[0]);
        }
    };

    return (
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Back to Dashboard</Text>
                </TouchableOpacity>

                <View style={styles.card}>
                    <View style={styles.header}>
                        <View style={styles.avatar}>
                            {user?.photo ? (
                                <Image source={{ uri: user.photo }} style={styles.profileImage} />
                            ) : (
                                <Text style={styles.avatarInitial}>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</Text>
                            )}
                        </View>
                        <Text style={styles.title}>Update Your Profile</Text>
                        <Text style={styles.subtitle}>Keep your information up to date</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <InputGroup label="Username" value={formData.username} onChangeText={(text) => handleChange("username", text)} />
                        <InputGroup label="Email Address" value={formData.email} onChangeText={(text) => handleChange("email", text)} keyboardType="email-address" />
                        <InputGroup label="Address" value={formData.address} onChangeText={(text) => handleChange("address", text)} />
                        
                        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                            <InputGroup label="Date of Birth" value={formData.date_of_birth} editable={false} />
                        </TouchableOpacity>
                        
                        <InputGroup label="ID Number" value={formData.id_number} onChangeText={(text) => handleChange("id_number", text)} />
                        <InputGroup label="Occupation" value={formData.job} onChangeText={(text) => handleChange("job", text)} />

                        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit} disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            {showDatePicker && (
                <DateTimePicker
                    value={new Date(formData.date_of_birth || new Date())}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                />
            )}
        </LinearGradient>
    );
}

// Reusable Input Component (no icon)
const InputGroup = ({ label, ...props }) => (
    <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <TextInput style={styles.input} placeholderTextColor="#9ca3af" {...props} />
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { justifyContent: 'center', alignItems: 'center', padding: 20, paddingBottom: 60 },
    backButton: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 20, left: 20, padding: 10 },
    backButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    card: { width: '100%', maxWidth: 700, backgroundColor: '#fff', borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10, overflow: 'hidden', marginTop: 80 },
    header: { padding: 24, alignItems: 'center' },
    avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(102, 126, 234, 0.5)', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'rgba(255, 255, 255, 0.3)', marginBottom: 16 },
    profileImage: { width: '100%', height: '100%', borderRadius: 50 },
    avatarInitial: { fontSize: 48, color: '#fff', fontWeight: 'bold' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
    subtitle: { fontSize: 15, color: '#6b7280', textAlign: 'center' },
    formContainer: { padding: 24, gap: 16 },
    inputGroup: { width: '100%' },
    label: { fontWeight: '600', fontSize: 14, color: '#374151', marginBottom: 8 },
    input: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, borderWidth: 2, borderColor: '#e5e7eb', fontSize: 15, backgroundColor: '#f9fafb' },
    saveButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, backgroundColor: '#667eea', marginTop: 12 },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});