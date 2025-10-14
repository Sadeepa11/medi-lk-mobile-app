import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import Header from '../components/Header';

// Reusable component for each feature item
const FeatureItem = ({ icon, title, description }) => (
    <View style={styles.featureItem}>
        <Text style={styles.featureIcon}>{icon}</Text>
        <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureDescription}>{description}</Text>
        </View>
    </View>
);

export default function About({ user, setUser }) {
    return (
        <>
            <Header user={user} setUser={setUser} />
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                
                <View style={styles.headerSection}>
                    <Image source={require('../assets/mediLKText.jpg')} style={styles.logo} />
                    <Text style={styles.appName}>MediLK</Text>
                    <Text style={styles.tagline}>Track your health, stay informed.</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Our Mission</Text>
                    <Text style={styles.bodyText}>
                        Our goal is to empower you to take control of your health. MediLK provides a simple, private, and effective way to monitor key health metrics, manage your medical records, and stay connected with your well-being, all from the convenience of your phone.
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Key Features</Text>
                    <FeatureItem
                        icon="⚖️"
                        title="Health Metric Tracking"
                        description="Log and visualize data for BMI, blood sugar, cholesterol, and more."
                    />
                    <View style={styles.divider} />
                    <FeatureItem
                        icon="📁"
                        title="Document Management"
                        description="Securely upload and store lab reports and prescriptions."
                    />
                    <View style={styles.divider} />
                    <FeatureItem
                        icon="🥗"
                        title="Dietary & Fluid Intake"
                        description="Keep a daily log of your food and water consumption to monitor your habits."
                    />
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Legal & Support</Text>
                    <TouchableOpacity style={styles.linkButton} onPress={() => Alert.alert("Static UI", "This would navigate to the Terms of Service screen.")}>
                        <Text style={styles.linkButtonText}>Terms of Service</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.linkButton} onPress={() => Alert.alert("Static UI", "This would navigate to the Privacy Policy screen.")}>
                        <Text style={styles.linkButtonText}>Privacy Policy</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Version 1.0.0</Text>
                    <Text style={styles.footerText}>© 2025 MediLK. All Rights Reserved.</Text>
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
    headerSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logo: {
        width: 200,
        height: 100,
        borderRadius: 20,
        marginBottom: 16,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    tagline: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 4,
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
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 16,
    },
    bodyText: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 22,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    featureIcon: {
        fontSize: 24,
        marginRight: 16,
        marginTop: 4,
    },
    featureTextContainer: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    featureDescription: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 16,
    },
    linkButton: {
        paddingVertical: 8,
    },
    linkButtonText: {
        fontSize: 16,
        color: '#4285F4',
        fontWeight: '500',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    footerText: {
        fontSize: 12,
        color: '#9ca3af',
    },
});