import React, { useEffect } from 'react';
import { View, ActivityIndicator, Image, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { version as appVersion } from '../package.json';

const SplashScreen = ({ navigation }) => {
    useEffect(() => {
        const checkLogin = async () => {
            // Add a minimum delay for splash screen visibility
            const delay = new Promise(resolve => setTimeout(resolve, 2000));
            
            const user = await AsyncStorage.getItem('user');
            
            // Wait for minimum delay
            await delay;
            
            if (user) {
                navigation.replace('Dashboard', { user: JSON.parse(user) });
            } else {
                navigation.replace('Login');
            }
        };
        checkLogin();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Image 
                        source={require('../assets/mediLKText.jpg')} 
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* App Name */}
                <Text style={styles.appName}>MediLK</Text>
                <Text style={styles.tagline}>Track your health, stay informed</Text>

                {/* Loading Indicator */}
                <ActivityIndicator 
                    size="large" 
                    color="#4285F4" 
                    style={styles.loader}
                />
            </View>

            {/* Footer */}
             <View style={styles.footer}>
                <Text style={styles.footerText}>Powered by MediLK</Text>
                <Text style={styles.version}>v{appVersion}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    logo: {
        width: 150,
        height: 150,
        borderRadius: 35,
    },
    appName: {
        fontSize: 40,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 8,
        letterSpacing: -1,
    },
    tagline: {
        fontSize: 16,
        color: '#666',
        fontWeight: '400',
        marginBottom: 50,
    },
    loader: {
        marginTop: 20,
    },
    footer: {
        paddingBottom: 40,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#999',
        fontWeight: '500',
        marginBottom: 4,
    },
    version: {
        fontSize: 12,
        color: '#BBB',
    },
});

export default SplashScreen;