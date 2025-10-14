import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Image,
} from 'react-native';
import Header from '../components/Header';

// Reusable component for each contact method
const ContactRow = ({ icon, label, value, actionText, onPress }) => (
    <View style={styles.contactRow}>
        <Text style={styles.contactIcon}>{icon}</Text>
        <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>{label}</Text>
            <Text style={styles.contactValue}>{value}</Text>
        </View>
        <TouchableOpacity style={styles.actionButton} onPress={onPress}>
            <Text style={styles.actionButtonText}>{actionText}</Text>
        </TouchableOpacity>
    </View>
);

export default function Contact({ user, setUser }) {
    const [form, setForm] = useState({ name: '', email: '', message: '' });

    const handleSendMessage = () => {
        if (!form.name || !form.email || !form.message) {
            Alert.alert("Missing Information", "Please fill out all fields in the form.");
        } else {
            Alert.alert(
                "Message Sent (Demonstration)",
                "Your message has been sent. Our team will get back to you shortly."
            );
            setForm({ name: '', email: '', message: '' });
        }
    };

    return (
        <>
            <Header user={user} setUser={setUser} />
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <Text style={styles.pageTitle}>📞 Get in Touch</Text>
                <Text style={styles.pageSubtitle}>We're here to help. Reach out to us through any of the channels below.</Text>
                
                {/* Emergency Contact Card */}
                <View style={[styles.card, styles.emergencyCard]}>
                    <Text style={styles.emergencyTitle}>In Case of Emergency</Text>
                    <Text style={styles.emergencyText}>For immediate medical assistance, please contact the local emergency services.</Text>
                    <ContactRow
                        icon="🚑"
                        label="Ambulance (Sri Lanka)"
                        value="1990"
                        actionText="Call Now"
                        onPress={() => Alert.alert("Emergency Call", "This would dial 1990.")}
                    />
                </View>

                {/* General Contact Card */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Support Channels</Text>
                    <ContactRow
                        icon="☎️"
                        label="Support Hotline"
                        value="+94 11 234 5678"
                        actionText="Call"
                        onPress={() => Alert.alert("Call Support", "This would dial the support hotline.")}
                    />
                    <View style={styles.divider} />
                    <ContactRow
                        icon="✉️"
                        label="Email Support"
                        value="support@medilk.com"
                        actionText="Email"
                        onPress={() => Alert.alert("Email Support", "This would open your default email app.")}
                    />
                    <View style={styles.divider} />
                    <ContactRow
                        icon="📍"
                        label="Our Office"
                        value="123 Galle Road, Colombo 03"
                        actionText="Map"
                        onPress={() => Alert.alert("Open Maps", "This would open the address in a map application.")}
                    />
                </View>

                {/* Contact Form Card */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Send Us a Message</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Your Name"
                        value={form.name}
                        onChangeText={(text) => setForm({...form, name: text})}
                        placeholderTextColor="#9ca3af"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Your Email Address"
                        value={form.email}
                        onChangeText={(text) => setForm({...form, email: text})}
                        keyboardType="email-address"
                        placeholderTextColor="#9ca3af"
                    />
                    <TextInput
                        style={[styles.input, styles.multilineInput]}
                        placeholder="Your Message..."
                        value={form.message}
                        onChangeText={(text) => setForm({...form, message: text})}
                        multiline
                        numberOfLines={4}
                        placeholderTextColor="#9ca3af"
                    />
                    <TouchableOpacity style={styles.submitButton} onPress={handleSendMessage}>
                        <Text style={styles.submitButtonText}>Send Message</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    content: {
        padding: 20,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    pageSubtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 8,
        marginBottom: 24,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    emergencyCard: {
        backgroundColor: '#FFFBEB',
        borderColor: '#F59E0B',
        borderWidth: 1,
    },
    emergencyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#D97706',
        marginBottom: 8,
        textAlign: 'center',
    },
    emergencyText: {
        fontSize: 14,
        color: '#B45309',
        textAlign: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 16,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    contactIcon: {
        fontSize: 24,
        marginRight: 16,
    },
    contactInfo: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 14,
        color: '#6b7280',
    },
    contactValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    actionButton: {
        backgroundColor: '#eef2ff',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    actionButtonText: {
        color: '#4338CA',
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 16,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        marginBottom: 12,
    },
    multilineInput: {
        height: 120,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#4285F4',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});