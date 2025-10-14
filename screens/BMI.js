import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
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
// SUB-COMPONENTS (DEFINED EXTERNALLY)
// ============================================

const ListHeader = ({ data, formData, setFormData, setShowDatePicker, submitBMI }) => {
    const stats = data.reduce(
        (acc, item) => {
            const bmi = parseFloat(item.bmi);
            return {
                count: acc.count + 1,
                avgBmi: acc.avgBmi + bmi,
                minBmi: acc.minBmi === null ? bmi : Math.min(acc.minBmi, bmi),
                maxBmi: acc.maxBmi === null ? bmi : Math.max(acc.maxBmi, bmi),
                latestBmi: bmi,
            };
        }, { count: 0, avgBmi: 0, minBmi: null, maxBmi: null, latestBmi: null }
    );
    const avgBmi = stats.count > 0 ? (stats.avgBmi / stats.count) : 0;
    const latestBmiCategory = stats.latestBmi ? getBMICategory(stats.latestBmi) : null;

    return (
        <>
            <Text style={styles.pageTitle}>⚖️ BMI Tracker</Text>
            
            <View style={styles.statsGrid}>
                <StatCard label="Current BMI" value={stats.latestBmi ? stats.latestBmi.toFixed(1) : "N/A"} icon="⚖️" color={latestBmiCategory?.color} subtitle={latestBmiCategory?.category} />
                <StatCard label="Average BMI" value={avgBmi > 0 ? avgBmi.toFixed(1) : "N/A"} icon="📊" color="#34A853" />
                <StatCard label="Records" value={stats.count} icon="📝" color="#FBBC05" />
                <StatCard label="BMI Range" value={stats.minBmi ? `${stats.minBmi.toFixed(1)}-${stats.maxBmi.toFixed(1)}` : "N/A"} icon="📈" color="#EA4335" />
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Record New Measurement</Text>
                <FormInput label="Date & Time" value={formData.datetime.toLocaleString()} onPress={() => setShowDatePicker(true)} />
                <FormInput label="Height (meters)" value={formData.height} onChangeText={(t) => setFormData(p => ({...p, height: t}))} placeholder="e.g., 1.75" keyboardType="numeric" />
                <FormInput label="Weight (kg)" value={formData.weight} onChangeText={(t) => setFormData(p => ({...p, weight: t}))} placeholder="e.g., 70.5" keyboardType="numeric" />
                
                {formData.height && formData.weight > 0 && <BmiPreview height={formData.height} weight={formData.weight} />}
                
                <TouchableOpacity style={styles.submitBtn} onPress={submitBMI}>
                    <Text style={styles.submitBtnText}>💾 Save BMI Record</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>BMI & Weight Trends</Text>
                {data.length > 0 ? <BmiChart data={data} /> : <Text style={styles.noDataText}>No data to display.</Text>}
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>BMI History</Text>
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 2 }]}>Date</Text>
                    <Text style={[styles.tableCell, styles.tableHeaderText]}>Weight</Text>
                    <Text style={[styles.tableCell, styles.tableHeaderText]}>Height</Text>
                    <Text style={[styles.tableCell, styles.tableHeaderText]}>BMI</Text>
                </View>
            </View>
        </>
    );
};

const ListFooter = () => (
    <View style={styles.card}>
        <Text style={styles.sectionTitle}>BMI Categories</Text>
        <BmiReferenceGuide />
    </View>
);

// ============================================
// MAIN BMI SCREEN COMPONENT
// ============================================
export default function BMI({ user, setUser }) {
    const [bmiData, setBmiData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        datetime: new Date(),
        height: "",
        weight: "",
    });
    const [showDatePicker, setShowDatePicker] = useState(false);

    const fetchBmiData = useCallback(async () => {
        // ✅ API FIX: Check for user.id, as confirmed by your user object.
        if (!user?.id) return;
        setLoading(true);
        try {
            // ✅ API FIX: Use user.id in the URL
            const url = `${API_BASE}/api/v1/bmi/${user.id}`;
            const response = await fetch(url);
            
            if (response.status === 404) {
                setBmiData([]);
                return;
            }
            if (!response.ok) throw new Error("Failed to fetch data");
            
            const result = await response.json();
            const dataArray = Array.isArray(result.data) ? result.data : (result || []);
            setBmiData(dataArray);
        } catch (e) {
            console.error("Fetch BMI data error:", e);
            Alert.alert("Error", "Could not fetch BMI data.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    const submitBMI = async () => {
        const { datetime, height, weight } = formData;
        if (!datetime || !height || !weight) {
            return Alert.alert("Missing Fields", "Please fill in date, height, and weight.");
        }

        const payload = {
            datetime: datetime.toISOString().slice(0, 19).replace('T', ' '),
            height: parseFloat(height),
            weight: parseFloat(weight),
            // ✅ API FIX: Send user.id as user_id
            user_id: user?.id,
        };
        
        try {
            const response = await fetch(`${API_BASE}/api/v1/bmi`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.detail || "Unknown error");

            Alert.alert("Success", "BMI record created successfully!");
            setFormData({ datetime: new Date(), height: "", weight: "" });
            fetchBmiData();
        } catch (error) {
            Alert.alert("Submission Error", error.message);
        }
    };

    useEffect(() => {
        fetchBmiData();
    }, [fetchBmiData]);

    if (loading) {
        return (
            <>
                <Header user={user} setUser={setUser} />
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#4285F4" />
                </View>
            </>
        );
    }

    return (
        <>
            <Header user={user} setUser={setUser} />
            {/* ✅ LAYOUT FIX: FlatList is the main scrolling container */}
            <FlatList
                style={styles.container}
                contentContainerStyle={styles.content}
                data={[...bmiData].reverse()}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={
                    <ListHeader 
                        data={bmiData}
                        formData={formData}
                        setFormData={setFormData}
                        setShowDatePicker={setShowDatePicker}
                        submitBMI={submitBMI}
                    />
                }
                ListFooterComponent={<ListFooter />}
                renderItem={({ item }) => {
                    const { color } = getBMICategory(item.bmi);
                    return (
                        <View style={styles.tableRowWrapper}>
                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCell, { flex: 2 }]}>{new Date(item.timestamp).toLocaleDateString()}</Text>
                                <Text style={styles.tableCell}>{item.weight} kg</Text>
                                <Text style={styles.tableCell}>{item.height} m</Text>
                                <Text style={[styles.tableCell, { color, fontWeight: 'bold' }]}>{parseFloat(item.bmi).toFixed(1)}</Text>
                            </View>
                        </View>
                    );
                }}
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
                        if (selectedDate) setFormData(p => ({...p, datetime: selectedDate}));
                    }}
                />
            )}
        </>
    );
}

// ============================================
// SUB-COMPONENTS & STYLES
// ============================================
const StatCard = ({ label, value, icon, color, subtitle }) => (
    <View style={styles.statCard}>
        <View>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={[styles.statValue, { color: color || '#1f2937' }]}>{value}</Text>
            {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
        <Text style={styles.statIcon}>{icon}</Text>
    </View>
);
const FormInput = ({ label, value, onPress, ...props }) => (
    <View style={styles.formGroup}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity onPress={onPress} disabled={!onPress}>
            <TextInput
                style={styles.input}
                value={value}
                editable={!onPress}
                pointerEvents={onPress ? 'none' : 'auto'}
                {...props}
            />
        </TouchableOpacity>
    </View>
);
const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: "Underweight", color: "#3B82F6" };
    if (bmi < 25) return { category: "Normal", color: "#10B981" };
    if (bmi < 30) return { category: "Overweight", color: "#F59E0B" };
    return { category: "Obese", color: "#EF4444" };
};
const BmiPreview = ({ height, weight }) => {
    const bmi = parseFloat(weight) / (parseFloat(height) * parseFloat(height));
    if (isNaN(bmi)) return null;
    const { category, color } = getBMICategory(bmi);
    return (
        <View style={styles.formGroup}>
            <Text style={styles.label}>Calculated BMI</Text>
            <View style={styles.bmiPreview}>
                <Text style={[styles.bmiPreviewText, { color }]}>{bmi.toFixed(1)}</Text>
                <Text style={[styles.bmiCategoryText, { color }]}>{category}</Text>
            </View>
        </View>
    );
};
const BmiChart = ({ data }) => {
    const chartData = {
        labels: data.map(item => new Date(item.timestamp).toLocaleDateString()),
        datasets: [{ data: data.map(item => parseFloat(item.bmi)) }],
    };
    return <LineChart data={chartData} width={screenWidth - 64} height={220} chartConfig={chartConfig} bezier style={styles.chart} />;
};
const BmiReferenceGuide = () => (
    <View style={styles.referenceGrid}>
        <View style={styles.referenceItem}><View style={[styles.bmiIndicator, {backgroundColor: '#3B82F6'}]} /><Text style={styles.referenceText}>Underweight: &lt; 18.5</Text></View>
        <View style={styles.referenceItem}><View style={[styles.bmiIndicator, {backgroundColor: '#10B981'}]} /><Text style={styles.referenceText}>Normal: 18.5-24.9</Text></View>
        <View style={styles.referenceItem}><View style={[styles.indicator, {backgroundColor: '#F59E0B'}]} /><Text style={styles.referenceText}>Overweight: 25-29.9</Text></View>
        <View style={styles.referenceItem}><View style={[styles.indicator, {backgroundColor: '#EF4444'}]} /><Text style={styles.referenceText}>Obese: ≥ 30</Text></View>
    </View>
);

const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(66, 133, 244, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
};
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f3f4f6" },
    content: { padding: 16 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
    statCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: '48%', marginBottom: 16, elevation: 2 },
    statLabel: { fontSize: 14, color: '#6b7280' },
    statValue: { fontSize: 28, fontWeight: 'bold', marginTop: 4 },
    statSubtitle: { fontSize: 12, fontWeight: '500', marginTop: 2, color: '#6b7280' },
    statIcon: { position: 'absolute', right: 16, top: 16, fontSize: 24, opacity: 0.5 },
    formGroup: { marginBottom: 12 },
    label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
    input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16 },
    submitBtn: { backgroundColor: '#4285F4', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
    submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    bmiPreview: { padding: 12, backgroundColor: '#eef2ff', borderRadius: 8, alignItems: 'center' },
    bmiPreviewText: { fontSize: 20, fontWeight: 'bold' },
    bmiCategoryText: { fontSize: 14, fontWeight: '500', marginTop: 2 },
    chart: { borderRadius: 8, marginVertical: 8 },
    noDataText: { textAlign: 'center', color: '#9ca3af', paddingVertical: 32 },
    tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e5e7eb', paddingBottom: 8, marginBottom: 8 },
    tableRowWrapper: { backgroundColor: '#fff', marginHorizontal: -16, paddingHorizontal: 16 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#f3f4f6', paddingVertical: 12 },
    tableCell: { flex: 1, fontSize: 14, color: '#374151', textAlign: 'center' },
    tableHeaderText: { fontWeight: 'bold', color: '#6b7280', fontSize: 12 },
    referenceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    referenceItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    bmiIndicator: { width: 12, height: 12, borderRadius: 6 },
    referenceText: { fontSize: 14, color: '#374151' },
});