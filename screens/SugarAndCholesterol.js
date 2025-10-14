import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Dimensions,
    Platform,
    FlatList,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import DateTimePicker from "@react-native-community/datetimepicker";
import Header from "../components/Header";

const screenWidth = Dimensions.get("window").width;

// ✅ Sample data to display in the UI
const SAMPLE_DATA = [
    { id: 1, datetime: '2025-10-10T09:00:00Z', fasting_sugar: 98, post_meal_sugar: 135, cholesterol: 190, hdl: 55, ldl: 115, triglycerides: 100 },
    { id: 2, datetime: '2025-10-11T09:15:00Z', fasting_sugar: 105, post_meal_sugar: 145, cholesterol: 205, hdl: 50, ldl: 130, triglycerides: 125 },
    { id: 3, datetime: '2025-10-12T08:45:00Z', fasting_sugar: 95, post_meal_sugar: 130, cholesterol: 185, hdl: 60, ldl: 105, triglycerides: 100 },
    { id: 4, datetime: '2025-10-13T09:05:00Z', fasting_sugar: 110, post_meal_sugar: 160, cholesterol: 210, hdl: 45, ldl: 140, triglycerides: 125 },
];

// ============================================
// HEADER & FOOTER COMPONENTS
// ============================================
const ListHeader = ({ data, formData, setFormData, setShowDatePicker }) => {
    const latestReading = data.length > 0 ? data[data.length - 1] : null;

    return (
        <>
            <Text style={styles.pageTitle}>🩸 Sugar & Cholesterol</Text>
            
            <View style={styles.statsGrid}>
                <StatCard label="Latest Fasting Sugar" value={latestReading?.fasting_sugar || "N/A"} unit="mg/dL" color="#EF4444" />
                <StatCard label="Latest Cholesterol" value={latestReading?.cholesterol || "N/A"} unit="mg/dL" color="#3B82F6" />
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Record New Readings</Text>
                <FormInput label="Date & Time" value={formData.datetime.toLocaleString()} onPress={() => setShowDatePicker(true)} />
                <View style={styles.formGrid}>
                    <FormInput label="Fasting Sugar" value={formData.fasting_sugar} onChangeText={(t) => setFormData(p => ({...p, fasting_sugar: t}))} unit="mg/dL" />
                    <FormInput label="Post-Meal Sugar" value={formData.post_meal_sugar} onChangeText={(t) => setFormData(p => ({...p, post_meal_sugar: t}))} unit="mg/dL" />
                    <FormInput label="Total Cholesterol" value={formData.cholesterol} onChangeText={(t) => setFormData(p => ({...p, cholesterol: t}))} unit="mg/dL" />
                    <FormInput label="HDL" value={formData.hdl} onChangeText={(t) => setFormData(p => ({...p, hdl: t}))} unit="mg/dL" />
                    <FormInput label="LDL" value={formData.ldl} onChangeText={(t) => setFormData(p => ({...p, ldl: t}))} unit="mg/dL" />
                    <FormInput label="Triglycerides" value={formData.triglycerides} onChangeText={(t) => setFormData(p => ({...p, triglycerides: t}))} unit="mg/dL" />
                </View>
                <TouchableOpacity style={styles.submitBtn} onPress={() => Alert.alert("Static UI", "This button is for demonstration only.")}>
                    <Text style={styles.submitBtnText}>💾 Save Readings</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Health Trends</Text>
                {data.length > 0 ? <HealthChart data={data} /> : <Text style={styles.noDataText}>No data to display.</Text>}
            </View>
            
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>History Log</Text>
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableCell, styles.tableHeaderText, {flex: 2}]}>Date</Text>
                    <Text style={[styles.tableCell, styles.tableHeaderText]}>Fasting</Text>
                    <Text style={[styles.tableCell, styles.tableHeaderText]}>Choles.</Text>
                    <Text style={[styles.tableCell, styles.tableHeaderText]}>LDL</Text>
                </View>
            </View>
        </>
    );
};

const ListFooter = () => (
    <View style={styles.card}>
        <Text style={styles.sectionTitle}>Reference Ranges</Text>
        <ReferenceGuide />
    </View>
);

// ============================================
// MAIN SCREEN COMPONENT
// ============================================
export default function SugarAndCholesterol({ user, setUser }) {
    // ✅ State is simplified: no loading state, and data is initialized with sample data
    const [data, setData] = useState(SAMPLE_DATA);
    const [formData, setFormData] = useState({
        datetime: new Date(),
        fasting_sugar: "", post_meal_sugar: "", cholesterol: "", hdl: "", ldl: "", triglycerides: "",
    });
    const [showDatePicker, setShowDatePicker] = useState(false);

    // ✅ All API-related functions (fetchData, submitReadings, useEffect) are removed.

    return (
        <>
            <Header user={user} setUser={setUser} />
            <FlatList
                style={styles.container}
                contentContainerStyle={styles.content}
                data={[...data].reverse()}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={
                    <ListHeader 
                        data={data}
                        formData={formData}
                        setFormData={setFormData}
                        setShowDatePicker={setShowDatePicker}
                    />
                }
                ListFooterComponent={<ListFooter />}
                renderItem={({ item }) => (
                    <View style={styles.tableRowWrapper}>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, { flex: 2 }]}>{new Date(item.datetime).toLocaleDateString()}</Text>
                            <Text style={styles.tableCell}>{item.fasting_sugar}</Text>
                            <Text style={styles.tableCell}>{item.cholesterol}</Text>
                            <Text style={styles.tableCell}>{item.ldl}</Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<View style={styles.card}><Text style={styles.noDataText}>No history found.</Text></View>}
            />
            {showDatePicker && (
                <DateTimePicker
                    value={formData.datetime}
                    mode="datetime"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowDatePicker(Platform.OS === 'ios');
                        if (selectedDate) setFormData(p => ({ ...p, datetime: selectedDate }));
                    }}
                />
            )}
        </>
    );
}

// ============================================
// SUB-COMPONENTS (Styling and minor logic)
// ============================================
const StatCard = ({ label, value, unit, color }) => (
    <View style={[styles.statCard, { borderTopColor: color, borderTopWidth: 4 }]}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>{value} <Text style={styles.statUnit}>{unit}</Text></Text>
    </View>
);
const FormInput = ({ label, unit, ...props }) => (
    <View style={styles.formGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.inputContainer}>
            <TextInput style={styles.input} keyboardType="numeric" {...props} />
            <Text style={styles.inputUnit}>{unit}</Text>
        </View>
    </View>
);
const HealthChart = ({ data }) => {
    const chartData = {
        labels: data.map(item => new Date(item.datetime).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})),
        datasets: [
            { data: data.map(item => parseFloat(item.fasting_sugar)), color: () => "#EF4444", strokeWidth: 2 },
            { data: data.map(item => parseFloat(item.cholesterol)), color: () => "#3B82F6", strokeWidth: 2 }
        ],
        legend: ["Fasting Sugar", "Cholesterol"]
    };
    return <LineChart data={chartData} width={screenWidth - 64} height={220} chartConfig={chartConfig} bezier />;
};
const ReferenceGuide = () => (
    <View style={styles.referenceGrid}>
        <Text style={styles.referenceTitle}>Fasting Sugar (mg/dL)</Text>
        <Text style={styles.referenceText}>- **Normal:** Less than 100</Text>
        <Text style={styles.referenceText}>- **Prediabetes:** 100 to 125</Text>
        <Text style={styles.referenceText}>- **Diabetes:** 126 or higher</Text>
        <Text style={styles.referenceTitle}>Total Cholesterol (mg/dL)</Text>
        <Text style={styles.referenceText}>- **Desirable:** Less than 200</Text>
        <Text style={styles.referenceText}>- **Borderline High:** 200 to 239</Text>
        <Text style={styles.referenceText}>- **High:** 240 or higher</Text>
    </View>
);

// ============================================
// STYLES & CONFIG
// ============================================
const chartConfig = {
    backgroundGradientFrom: "#fff", backgroundGradientTo: "#fff", decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
};
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f3f4f6" },
    content: { padding: 16 },
    pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 16 },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 12 },
    statCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flex: 1, elevation: 2 },
    statLabel: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
    statValue: { fontSize: 28, fontWeight: 'bold' },
    statUnit: { fontSize: 14, fontWeight: 'normal' },
    formGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    formGroup: { width: '48%', marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8 },
    input: { padding: 12, fontSize: 16, flex: 1 },
    inputUnit: { paddingRight: 12, color: '#9ca3af' },
    submitBtn: { backgroundColor: '#4285F4', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
    submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    noDataText: { textAlign: 'center', color: '#9ca3af', paddingVertical: 32 },
    tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e5e7eb', paddingBottom: 8 },
    tableRowWrapper: { backgroundColor: '#fff', marginHorizontal: -16, paddingHorizontal: 16 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#f3f4f6', paddingVertical: 14 },
    tableCell: { flex: 1, fontSize: 14, textAlign: 'center', color: '#374151' },
    tableHeaderText: { fontWeight: 'bold', color: '#6b7280', fontSize: 12 },
    referenceGrid: { gap: 6 },
    referenceTitle: { fontWeight: 'bold', fontSize: 15, marginTop: 8, color: '#374151' },
    referenceText: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
});