import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import Header from '../components/Header';

// ✅ Sample static data for prescriptions
const SAMPLE_PRESCRIPTIONS = [
    {
        id: '1',
        name: 'Metformin',
        dosage: '500 mg',
        instructions: 'Take one tablet twice daily with meals.',
        prescribedBy: 'Dr. Emily Carter',
        date: '2025-09-15',
        refillsLeft: 2,
        status: 'Active',
    },
    {
        id: '2',
        name: 'Lisinopril',
        dosage: '10 mg',
        instructions: 'Take one tablet every morning.',
        prescribedBy: 'Dr. Emily Carter',
        date: '2025-09-15',
        refillsLeft: 1,
        status: 'Active',
    },
    {
        id: '3',
        name: 'Atorvastatin',
        dosage: '20 mg',
        instructions: 'Take one tablet at bedtime.',
        prescribedBy: 'Dr. Ben Jacobs',
        date: '2025-08-20',
        refillsLeft: 0,
        status: 'Refill Needed',
    },
    {
        id: '4',
        name: 'Amoxicillin',
        dosage: '250 mg',
        instructions: 'Take one capsule every 8 hours for 7 days.',
        prescribedBy: 'Dr. Emily Carter',
        date: '2025-07-01',
        refillsLeft: 0,
        status: 'Expired',
    },
];

// Reusable component for each prescription item in the list
const PrescriptionCard = ({ item }) => {
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Active':
                return { backgroundColor: '#D1FAE5', color: '#065F46' };
            case 'Refill Needed':
                return { backgroundColor: '#FEF3C7', color: '#92400E' };
            case 'Expired':
                return { backgroundColor: '#FEE2E2', color: '#991B1B' };
            default:
                return { backgroundColor: '#E5E7EB', color: '#4B5563' };
        }
    };
    const statusStyle = getStatusStyle(item.status);

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.medicationName}>{item.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                    <Text style={[styles.statusText, { color: statusStyle.color }]}>{item.status}</Text>
                </View>
            </View>
            <Text style={styles.dosage}>{item.dosage}</Text>
            <Text style={styles.detailText}>{item.instructions}</Text>
            <View style={styles.divider} />
            <Text style={styles.detailText}>Prescribed by: {item.prescribedBy}</Text>
            <Text style={styles.detailText}>Date: {item.date}</Text>
            <Text style={styles.detailText}>Refills Left: {item.refillsLeft}</Text>
            
            {item.status !== 'Expired' && (
                <TouchableOpacity style={styles.refillButton}>
                    <Text style={styles.refillButtonText}>Request Refill</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};


export default function Prescription({ user, setUser }) {
    const activePrescriptions = SAMPLE_PRESCRIPTIONS.filter(p => p.status === 'Active').length;
    const refillNeeded = SAMPLE_PRESCRIPTIONS.filter(p => p.status === 'Refill Needed').length;

    return (
        <>
            <Header user={user} setUser={setUser} />
            <FlatList
                style={styles.container}
                data={SAMPLE_PRESCRIPTIONS}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <PrescriptionCard item={item} />}
                ListHeaderComponent={
                    <>
                        <Text style={styles.pageTitle}>💊 My Prescriptions</Text>
                        <View style={styles.summaryContainer}>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryValue}>{activePrescriptions}</Text>
                                <Text style={styles.summaryLabel}>Active</Text>
                            </View>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryValue}>{refillNeeded}</Text>
                                <Text style={styles.summaryLabel}>Need Refill</Text>
                            </View>
                        </View>
                        <Text style={styles.listTitle}>All Prescriptions</Text>
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
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 24,
        gap: 16,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    summaryValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#4285F4',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
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
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    medicationName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    dosage: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 12,
    },
    detailText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        marginBottom: 4,
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
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 12,
    },
    refillButton: {
        backgroundColor: '#4285F4',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        marginTop: 12,
    },
    refillButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});