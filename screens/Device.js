import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
} from 'react-native';
import Header from '../components/Header';

// ✅ Sample static data for connected devices
const SAMPLE_DEVICES = [
    {
        id: '1',
        name: 'Smart Blood Pressure Monitor',
        model: 'Model BP-A500',
        icon: '❤️',
        status: 'Connected',
        battery: 85,
        lastSync: 'Today, 8:15 AM',
    },
    {
        id: '2',
        name: 'Gluco-Meter Sync',
        model: 'Model GM-20',
        icon: '🩸',
        status: 'Low Battery',
        battery: 15,
        lastSync: 'Yesterday, 9:20 PM',
    },
    {
        id: '3',
        name: 'Digital Weighing Scale',
        model: 'Scale-B1',
        icon: '⚖️',
        status: 'Disconnected',
        battery: 0,
        lastSync: 'Oct 10, 2025',
    },
];

// Reusable component for each device in the list
const DeviceCard = ({ item }) => {
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Connected':
                return { backgroundColor: '#D1FAE5', color: '#065F46' };
            case 'Low Battery':
                return { backgroundColor: '#FEF3C7', color: '#92400E' };
            default:
                return { backgroundColor: '#E5E7EB', color: '#4B5563' };
        }
    };
    const statusStyle = getStatusStyle(item.status);

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.deviceIconContainer}>
                    <Text style={styles.deviceIcon}>{item.icon}</Text>
                </View>
                <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{item.name}</Text>
                    <Text style={styles.deviceModel}>{item.model}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                    <Text style={[styles.statusText, { color: statusStyle.color }]}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.deviceDetails}>
                <Text style={styles.detailText}>Battery: {item.battery}%</Text>
                <Text style={styles.detailText}>Last Sync: {item.lastSync}</Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => Alert.alert("Static UI", "This would remove the device.")}>
                    <Text style={styles.secondaryButtonText}>Remove</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton} onPress={() => Alert.alert("Static UI", "This would force a sync with the device.")}>
                    <Text style={styles.primaryButtonText}>Sync Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default function Device({ user, setUser }) {
    return (
        <>
            <Header user={user} setUser={setUser} />
            <FlatList
                style={styles.container}
                data={SAMPLE_DEVICES}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <DeviceCard item={item} />}
                ListHeaderComponent={
                    <>
                        <Text style={styles.pageTitle}>💻 My Devices</Text>
                        <TouchableOpacity style={styles.addDeviceButton} onPress={() => Alert.alert("Static UI", "This would open the device pairing screen.")}>
                            <Text style={styles.addDeviceButtonText}>+ Add New Device</Text>
                        </TouchableOpacity>
                        <Text style={styles.listTitle}>Connected Devices</Text>
                    </>
                }
                contentContainerStyle={styles.content}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    content: {
        padding: 16,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
    },
    addDeviceButton: {
        backgroundColor: '#4285F4',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 24,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    addDeviceButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    listTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    deviceIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#eef2ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    deviceIcon: {
        fontSize: 24,
    },
    deviceInfo: {
        flex: 1,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    deviceModel: {
        fontSize: 14,
        color: '#6b7280',
    },
    statusBadge: {
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 10,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    deviceDetails: {
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 12,
        marginBottom: 12,
    },
    detailText: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
    primaryButton: {
        backgroundColor: '#34A853',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    primaryButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#f3f4f6',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    secondaryButtonText: {
        color: '#374151',
        fontWeight: '600',
    },
});