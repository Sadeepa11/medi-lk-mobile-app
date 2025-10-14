import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Dimensions,
    ActivityIndicator,
    Platform,
    FlatList,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import DateTimePicker from "@react-native-community/datetimepicker";
import Header from "../components/Header";

const API_BASE = "https://nearyala.lk";
const screenWidth = Dimensions.get("window").width;


// ============================================
// ✅ HEADER AND FOOTER COMPONENTS (MOVED OUTSIDE)
// ============================================

const ListHeader = ({ earData, formData, setShowDatePicker, setFormData, submitEarTest }) => (
    <>
        <Text style={styles.pageTitle}>👂 Ear Health Tracker</Text>
        
        <EarStats data={earData} />

        {/* Ear Test Form */}
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Record New Ear Test</Text>
            <FormInput label="Date & Time" value={formData.datetime.toLocaleString()} onPress={() => setShowDatePicker(true)} />
            
            <Text style={styles.subSectionTitle}>Left Ear</Text>
            <View style={styles.formGrid}>
                <FormInput label="High Freq (dB)" value={formData.LHigh} onChangeText={(t) => setFormData(p => ({...p, LHigh: t}))} />
                <FormInput label="Medium Freq (dB)" value={formData.LMedium} onChangeText={(t) => setFormData(p => ({...p, LMedium: t}))} />
                <FormInput label="Low Freq (dB)" value={formData.LLow} onChangeText={(t) => setFormData(p => ({...p, LLow: t}))} />
            </View>

            <Text style={styles.subSectionTitle}>Right Ear</Text>
            <View style={styles.formGrid}>
                <FormInput label="High Freq (dB)" value={formData.RHigh} onChangeText={(t) => setFormData(p => ({...p, RHigh: t}))} />
                <FormInput label="Medium Freq (dB)" value={formData.RMedium} onChangeText={(t) => setFormData(p => ({...p, RMedium: t}))} />
                <FormInput label="Low Freq (dB)" value={formData.RLow} onChangeText={(t) => setFormData(p => ({...p, RLow: t}))} />
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={submitEarTest}>
                <Text style={styles.submitBtnText}>💾 Save Ear Test Record</Text>
            </TouchableOpacity>
        </View>

        {/* Chart */}
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Hearing Frequency Trends</Text>
            {earData.length > 0 ? <EarChart data={earData} /> : <Text style={styles.noDataText}>No data to display.</Text>}
        </View>

        {/* History Table Title and Header */}
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Ear Test History</Text>
            <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 2 }]}>Date</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>L-High</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>L-Med</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>L-Low</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>R-High</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>R-Med</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>R-Low</Text>
            </View>
        </View>
    </>
);

const ListFooter = () => (
    <View style={styles.card}>
        <Text style={styles.sectionTitle}>Hearing Level Reference</Text>
        <HearingReferenceGuide />
    </View>
);


// ============================================
// MAIN EAR SCREEN COMPONENT
// ============================================
export default function Ear({ user, setUser }) {
    const [earData, setEarData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        datetime: new Date(),
        LHigh: "", LMedium: "", LLow: "",
        RHigh: "", RMedium: "", RLow: "",
    });
    const [showDatePicker, setShowDatePicker] = useState(false);

    const fetchEarData = useCallback(async () => {
        if (!user?.user_uid) return;
        setLoading(true);
        try {
            const url = `${API_BASE}/api/v1/ear/${user.user_uid}`;
            const response = await fetch(url);
            if (response.status === 404) {
                setEarData([]);
                return;
            }
            if (!response.ok) throw new Error("Failed to fetch data");
            const result = await response.json();
            const dataArray = result.data?.data || result.data || result || [];
            setEarData(dataArray);
        } catch (e) {
            console.error("Fetch ear data error:", e);
            Alert.alert("Error", "Could not fetch ear health data.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    const submitEarTest = async () => {
        if (Object.values(formData).some(val => val === "")) {
            return Alert.alert("Missing Fields", "Please fill all frequency fields for both ears.");
        }
        const payload = {
            ...formData,
            datetime: formData.datetime.toISOString().slice(0, 19).replace('T', ' '),
            user_id: user.user_uid,
        };
        try {
            const response = await fetch(`${API_BASE}/api/v1/ear`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.detail || "Submission failed");
            Alert.alert("Success", "Ear test record created successfully!");
            setFormData({
                datetime: new Date(), LHigh: "", LMedium: "", LLow: "", RHigh: "", RMedium: "", RLow: "",
            });
            fetchEarData();
        } catch (error) {
            Alert.alert("Submission Error", error.message);
        }
    };

    useEffect(() => {
        fetchEarData();
    }, [fetchEarData]);

    if (loading) {
        return (
            <>
                <Header user={user} setUser={setUser} />
                <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#4285F4" /></View>
            </>
        );
    }

    return (
        <>
            <Header user={user} setUser={setUser} />
            <FlatList
                style={styles.container}
                contentContainerStyle={styles.content}
                data={[...earData].reverse()}
                keyExtractor={(item) => item.id.toString()}
                // ✅ Pass state and functions down as props
                ListHeaderComponent={
                    <ListHeader 
                        earData={earData}
                        formData={formData}
                        setFormData={setFormData}
                        setShowDatePicker={setShowDatePicker}
                        submitEarTest={submitEarTest}
                    />
                }
                ListFooterComponent={<ListFooter />}
                renderItem={({ item }) => (
                    <View style={styles.tableRowWrapper}>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, { flex: 2 }]}>{new Date(item.datetime).toLocaleDateString()}</Text>
                            <Text style={[styles.tableCell, { color: getHearingLevel(item.LHigh).color }]}>{item.LHigh}</Text>
                            <Text style={[styles.tableCell, { color: getHearingLevel(item.LMedium).color }]}>{item.LMedium}</Text>
                            <Text style={[styles.tableCell, { color: getHearingLevel(item.LLow).color }]}>{item.LLow}</Text>
                            <Text style={[styles.tableCell, { color: getHearingLevel(item.RHigh).color }]}>{item.RHigh}</Text>
                            <Text style={[styles.tableCell, { color: getHearingLevel(item.RMedium).color }]}>{item.RMedium}</Text>
                            <Text style={[styles.tableCell, { color: getHearingLevel(item.RLow).color }]}>{item.RLow}</Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                  <View style={styles.card}><Text style={styles.noDataText}>No history found.</Text></View>
                }
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
// SUB-COMPONENTS (Unchanged from before)
// ============================================
const getHearingLevel = (value) => {
    if (value <= 10) return { level: "Excellent", color: "#4ECDC4" };
    if (value <= 20) return { level: "Good", color: "#34A853" };
    if (value <= 25) return { level: "Normal", color: "#4285F4" };
    if (value <= 40) return { level: "Fair", color: "#FBBC05" };
    return { level: "Poor", color: "#FF6B6B" };
};
const StatCard = ({ label, value, unit, color, subtitle }) => (
    <View style={styles.statCard}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>{value} <Text style={styles.statUnit}>{unit}</Text></Text>
        {subtitle && <Text style={[styles.statSubtitle, { color }]}>{subtitle}</Text>}
    </View>
);
const EarStats = ({data}) => {
    const stats = data.reduce((acc, item) => {
        const leftAvg = ((parseFloat(item.LHigh) || 0) + (parseFloat(item.LMedium) || 0) + (parseFloat(item.LLow) || 0)) / 3;
        const rightAvg = ((parseFloat(item.RHigh) || 0) + (parseFloat(item.RMedium) || 0) + (parseFloat(item.RLow) || 0)) / 3;
        return {
            count: acc.count + 1,
            avgLeft: acc.avgLeft + leftAvg,
            avgRight: acc.avgRight + rightAvg,
        };
    }, { count: 0, avgLeft: 0, avgRight: 0 });
    
    const avgLeft = stats.count > 0 ? (stats.avgLeft / stats.count).toFixed(1) : "N/A";
    const avgRight = stats.count > 0 ? (stats.avgRight / stats.count).toFixed(1) : "N/A";
    const latest = data.length > 0 ? data[data.length - 1] : null;

    return (
        <View style={styles.statsGrid}>
            <StatCard label="Avg Left Ear" value={avgLeft} unit="dB" color="#4285F4" />
            <StatCard label="Avg Right Ear" value={avgRight} unit="dB" color="#34A853" />
            {latest && <StatCard label="Latest Left High" value={latest.LHigh} unit="dB" color={getHearingLevel(latest.LHigh).color} subtitle={getHearingLevel(latest.LHigh).level} />}
            {latest && <StatCard label="Latest Right High" value={latest.RHigh} unit="dB" color={getHearingLevel(latest.RHigh).color} subtitle={getHearingLevel(latest.RHigh).level} />}
        </View>
    )
};
const FormInput = ({ label, value, onPress, ...props }) => (
    <View style={styles.formGroup}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity onPress={onPress} disabled={!onPress}>
            <TextInput style={styles.input} value={String(value)} editable={!onPress} pointerEvents={onPress ? 'none' : 'auto'} keyboardType="numeric" {...props} />
        </TouchableOpacity>
    </View>
);
const EarChart = ({ data }) => {
    if (data.length === 0) return null; // Prevent chart from crashing with no data
    const chartData = {
        labels: data.map(item => new Date(item.datetime).toLocaleDateString()),
        datasets: [
            { data: data.map(item => parseFloat(item.LHigh)), color: () => "#FF6B6B", strokeWidth: 2 },
            { data: data.map(item => parseFloat(item.RHigh)), color: () => "#FFD93D", strokeWidth: 2 },
        ],
        legend: ["Left High", "Right High"]
    };
    return <LineChart data={chartData} width={screenWidth - 64} height={220} chartConfig={chartConfig} bezier style={styles.chart} />;
};
const HearingReferenceGuide = () => (
    <View style={styles.referenceGrid}>
        <View style={styles.referenceItem}><View style={[styles.indicator, {backgroundColor: '#4ECDC4'}]} /><Text>Excellent (0-10 dB)</Text></View>
        <View style={styles.referenceItem}><View style={[styles.indicator, {backgroundColor: '#34A853'}]} /><Text>Good (10-20 dB)</Text></View>
        <View style={styles.referenceItem}><View style={[styles.indicator, {backgroundColor: '#4285F4'}]} /><Text>Normal (20-25 dB)</Text></View>
        <View style={styles.referenceItem}><View style={[styles.indicator, {backgroundColor: '#FBBC05'}]} /><Text>Fair (25-40 dB)</Text></View>
        <View style={styles.referenceItem}><View style={[styles.indicator, {backgroundColor: '#FF6B6B'}]} /><Text>Poor (40+ dB)</Text></View>
    </View>
);

// ============================================
// STYLES & CONFIG
// ============================================
const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f3f4f6" },
    content: { padding: 16 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
    subSectionTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginTop: 12, marginBottom: 8, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 12 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    statCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: '48%', marginBottom: 16, elevation: 2 },
    statLabel: { fontSize: 14, color: '#6b7280' },
    statValue: { fontSize: 24, fontWeight: 'bold' },
    statUnit: { fontSize: 14, color: '#9ca3af' },
    statSubtitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },
    formGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    formGroup: { width: '32%', marginBottom: 12 },
    label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
    input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, textAlign: 'center' },
    submitBtn: { backgroundColor: '#4285F4', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
    submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    chart: { borderRadius: 8, marginVertical: 8 },
    noDataText: { textAlign: 'center', color: '#9ca3af', paddingVertical: 32 },
    tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e5e7eb', paddingBottom: 8, marginBottom: 8 },
    tableRowWrapper: { backgroundColor: '#fff', marginHorizontal: -16, paddingHorizontal: 16 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#f3f4f6', paddingVertical: 12 },
    tableCell: { flex: 1, fontSize: 12, color: '#374151', textAlign: 'center' },
    tableHeaderText: { fontWeight: 'bold', color: '#6b7280' },
    referenceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    referenceItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    indicator: { width: 12, height: 12, borderRadius: 6 },
});