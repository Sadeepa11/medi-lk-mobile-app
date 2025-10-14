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
// EYE SCREEN COMPONENT
// ============================================
export default function Eye({ user, setUser }) {
    const [eyeData, setEyeData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        datetime: new Date(),
        L1: "", L2: "", L3: "", L4: "", L5: "", L6: "",
        R1: "", R2: "", R3: "", R4: "", R5: "", R6: "",
    });
    const [showDatePicker, setShowDatePicker] = useState(false);

    // --- API & DATA LOGIC ---
    const fetchEyeData = useCallback(async () => {
        if (!user?.user_uid) return;
        setLoading(true);
        try {
            const url = `${API_BASE}/api/v1/eye/${user.user_uid}`;
            const response = await fetch(url);
            if (response.status === 404) {
                setEyeData([]);
                setFilteredData([]);
                return;
            }
            if (!response.ok) throw new Error("Failed to fetch data");

            const result = await response.json();
            const dataArray = result.data?.data || result.data || result || [];
            setEyeData(dataArray);
            setFilteredData(dataArray);
        } catch (e) {
            console.error("Fetch eye data error:", e);
            Alert.alert("Error", "Could not fetch eye vision data.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    const submitEyeTest = async () => {
        if (Object.values(formData).some(val => val === "")) {
            return Alert.alert("Missing Fields", "Please fill all 12 vision acuity fields.");
        }
        
        const payload = Object.entries(formData).reduce((acc, [key, value]) => {
            acc[key] = key === 'datetime' ? value.toISOString().slice(0, 19).replace('T', ' ') : parseFloat(value);
            return acc;
        }, {});
        payload.user_id = user.user_uid;

        try {
            const response = await fetch(`${API_BASE}/api/v1/eye`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.detail || "Submission failed");

            Alert.alert("Success", "Eye test record created successfully!");
            setFormData({
                datetime: new Date(),
                L1: "", L2: "", L3: "", L4: "", L5: "", L6: "",
                R1: "", R2: "", R3: "", R4: "", R5: "", R6: "",
            });
            fetchEyeData();
        } catch (error) {
            Alert.alert("Submission Error", error.message);
        }
    };

    useEffect(() => {
        fetchEyeData();
    }, [fetchEyeData]);

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
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <Text style={styles.pageTitle}>👁️ Eye Vision Tracker</Text>
                
                <EyeStats data={filteredData} />

                {/* Eye Test Form */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Record New Vision Test</Text>
                    <FormInput label="Date & Time" value={formData.datetime.toLocaleString()} onPress={() => setShowDatePicker(true)} />
                    
                    <Text style={styles.subSectionTitle}>Left Eye Acuity</Text>
                    <View style={styles.formGrid}>
                        {['L1', 'L2', 'L3', 'L4', 'L5', 'L6'].map(key => (
                             <FormInput key={key} label={`Pos ${key[1]}`} value={formData[key]} onChangeText={(t) => setFormData(p => ({...p, [key]: t}))} />
                        ))}
                    </View>

                    <Text style={styles.subSectionTitle}>Right Eye Acuity</Text>
                     <View style={styles.formGrid}>
                        {['R1', 'R2', 'R3', 'R4', 'R5', 'R6'].map(key => (
                             <FormInput key={key} label={`Pos ${key[1]}`} value={formData[key]} onChangeText={(t) => setFormData(p => ({...p, [key]: t}))} />
                        ))}
                    </View>

                    <TouchableOpacity style={styles.submitBtn} onPress={submitEyeTest}>
                        <Text style={styles.submitBtnText}>💾 Save Eye Test Record</Text>
                    </TouchableOpacity>
                </View>

                {/* Chart */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Average Vision Trends</Text>
                    {filteredData.length > 0 ? <EyeChart data={filteredData} /> : <Text style={styles.noDataText}>No data to display.</Text>}
                </View>
                
                {/* Vision Quality Reference */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Vision Quality Reference</Text>
                    <VisionReferenceGuide />
                </View>

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
            </ScrollView>
        </>
    );
}

// ============================================
// SUB-COMPONENTS
// ============================================
const getVisionQuality = (value) => {
    if (value >= 1.0) return { quality: "Excellent", color: "#4ECDC4" };
    if (value >= 0.8) return { quality: "Good", color: "#34A853" };
    if (value >= 0.6) return { quality: "Normal", color: "#4285F4" };
    if (value >= 0.4) return { quality: "Fair", color: "#FBBC05" };
    return { quality: "Poor", color: "#FF6B6B" };
};

const StatCard = ({ label, value, unit, color, subtitle }) => (
    <View style={styles.statCard}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>{value} <Text style={styles.statUnit}>{unit}</Text></Text>
        {subtitle && <Text style={[styles.statSubtitle, { color }]}>{subtitle}</Text>}
    </View>
);

const EyeStats = ({data}) => {
    const stats = data.reduce((acc, item) => {
        const leftAvg = (['L1','L2','L3','L4','L5','L6'].reduce((sum, key) => sum + (parseFloat(item[key]) || 0), 0)) / 6;
        const rightAvg = (['R1','R2','R3','R4','R5','R6'].reduce((sum, key) => sum + (parseFloat(item[key]) || 0), 0)) / 6;
        return {
            count: acc.count + 1,
            avgLeft: acc.avgLeft + leftAvg,
            avgRight: acc.avgRight + rightAvg,
        };
    }, { count: 0, avgLeft: 0, avgRight: 0 });
    
    const avgLeft = stats.count > 0 ? (stats.avgLeft / stats.count).toFixed(2) : "N/A";
    const avgRight = stats.count > 0 ? (stats.avgRight / stats.count).toFixed(2) : "N/A";
    const latest = data.length > 0 ? data[data.length - 1] : null;

    return (
        <View style={styles.statsGrid}>
            <StatCard label="Avg Left Eye" value={avgLeft} color="#4285F4" subtitle={avgLeft !== "N/A" ? getVisionQuality(avgLeft).quality : ""} />
            <StatCard label="Avg Right Eye" value={avgRight} color="#34A853" subtitle={avgRight !== "N/A" ? getVisionQuality(avgRight).quality : ""} />
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

const EyeChart = ({ data }) => {
    const chartData = {
        labels: data.map(item => new Date(item.datetime).toLocaleDateString()),
        datasets: [
            { 
                data: data.map(item => (['L1','L2','L3','L4','L5','L6'].reduce((sum, key) => sum + (parseFloat(item[key]) || 0), 0)) / 6),
                color: () => "#4285F4", strokeWidth: 2 
            },
            { 
                data: data.map(item => (['R1','R2','R3','R4','R5','R6'].reduce((sum, key) => sum + (parseFloat(item[key]) || 0), 0)) / 6),
                color: () => "#34A853", strokeWidth: 2 
            },
        ],
        legend: ["Avg Left Eye", "Avg Right Eye"]
    };
    return <LineChart data={chartData} width={screenWidth - 64} height={220} chartConfig={chartConfig} bezier style={styles.chart} yAxisSuffix="" yAxisInterval={1} />;
};

const VisionReferenceGuide = () => (
    <View style={styles.referenceGrid}>
        <View style={styles.referenceItem}><View style={[styles.indicator, {backgroundColor: '#4ECDC4'}]} /><Text>Excellent (≥ 1.0)</Text></View>
        <View style={styles.referenceItem}><View style={[styles.indicator, {backgroundColor: '#34A853'}]} /><Text>Good (0.8-0.9)</Text></View>
        <View style={styles.referenceItem}><View style={[styles.indicator, {backgroundColor: '#4285F4'}]} /><Text>Normal (0.6-0.7)</Text></View>
        <View style={styles.referenceItem}><View style={[styles.indicator, {backgroundColor: '#FBBC05'}]} /><Text>Fair (0.4-0.5)</Text></View>
        <View style={styles.referenceItem}><View style={[styles.indicator, {backgroundColor: '#FF6B6B'}]} /><Text>Poor (&lt; 0.4)</Text></View>
    </View>
);

// ============================================
// STYLES & CONFIG
// ============================================
const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f3f4f6" },
    content: { padding: 16, paddingBottom: 48 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
    subSectionTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginTop: 16, marginBottom: 8, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 16 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    statCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: '48%', marginBottom: 16, elevation: 2 },
    statLabel: { fontSize: 14, color: '#6b7280' },
    statValue: { fontSize: 24, fontWeight: 'bold' },
    statUnit: { fontSize: 14, color: '#9ca3af' },
    statSubtitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },
    formGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    formGroup: { width: '31%', marginBottom: 12 },
    label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
    input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, textAlign: 'center' },
    submitBtn: { backgroundColor: '#4285F4', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
    submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    chart: { borderRadius: 8, marginVertical: 8 },
    noDataText: { textAlign: 'center', color: '#9ca3af', paddingVertical: 32 },
    referenceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    referenceItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    indicator: { width: 12, height: 12, borderRadius: 6 },
});