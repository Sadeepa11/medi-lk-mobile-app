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
    FlatList,
    Image,
    Platform,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { launchImageLibrary } from 'react-native-image-picker';
import Header from "../components/Header";

const API_BASE = "https://nearyala.lk";
const screenWidth = Dimensions.get("window").width;

// ============================================
// HEADER COMPONENT (DEFINED EXTERNALLY)
// ============================================
const ListHeader = ({ data, formData, setFormData, handleImagePick, submitReport }) => (
    <>
        <Text style={styles.pageTitle}>🏥 Medical Lab Reports</Text>
        <ReportStats data={data} />

        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Upload New Medical Report</Text>
            <View style={styles.formGrid}>
                <FormInput label="Fasting Sugar (mg/dL)" value={formData.fasting_sugar} onChangeText={(t) => setFormData(p => ({...p, fasting_sugar: t}))} />
                <FormInput label="Random Sugar (mg/dL)" value={formData.random_sugar} onChangeText={(t) => setFormData(p => ({...p, random_sugar: t}))} />
                <FormInput label="Cholesterol (mg/dL)" value={formData.cholesterol} onChangeText={(t) => setFormData(p => ({...p, cholesterol: t}))} />
                <FormInput label="HCG (mIU/mL)" value={formData.hcg} onChangeText={(t) => setFormData(p => ({...p, hcg: t}))} />
            </View>
            <ImagePicker onPick={handleImagePick} image={formData.reportImage} />
            <TouchableOpacity style={styles.submitBtn} onPress={submitReport}>
                <Text style={styles.submitBtnText}>📤 Submit Report</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Health Metrics Trends</Text>
            {data.length > 0 ? <ReportChart data={data} /> : <Text style={styles.noDataText}>No data to display.</Text>}
        </View>

        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Medical Report Records</Text>
            <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 2 }]}>Date</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>Fasting</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>Random</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>Choles.</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>Image</Text>
            </View>
        </View>
    </>
);

// ============================================
// MAIN LAB REPORT SCREEN COMPONENT
// ============================================
export default function Lab({ user, setUser }) {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        fasting_sugar: "", random_sugar: "", cholesterol: "", hcg: "", reportImage: null,
    });

    const fetchReportData = useCallback(async () => {
        if (!user?.user_uid) return;
        setLoading(true);
        try {
            const url = `${API_BASE}/api/v1/report/${user.user_uid}`;
            const response = await fetch(url);
            if (response.status === 404) { setReportData([]); return; }
            if (!response.ok) throw new Error("Failed to fetch reports");
            const result = await response.json();
            const dataArray = result.data?.data || result.data || result || [];
            setReportData(dataArray);
        } catch (e) {
            console.error("Fetch reports error:", e);
            Alert.alert("Error", "Could not fetch lab reports.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    const handleImagePick = () => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.didCancel) return;
            if (response.errorCode) return Alert.alert('ImagePicker Error', response.errorMessage);
            if (response.assets && response.assets.length > 0) {
                setFormData(prev => ({ ...prev, reportImage: response.assets[0] }));
            }
        });
    };

    const submitReport = async () => {
        const { reportImage, ...otherFields } = formData;
        if (Object.values(otherFields).some(field => !field) || !reportImage) {
            return Alert.alert("Missing Fields", "Please fill all fields and upload an image.");
        }

        const formPayload = new FormData();
        formPayload.append("user_uid", user.user_uid);
        Object.keys(otherFields).forEach(key => formPayload.append(key, otherFields[key]));

        formPayload.append('report_image', {
            uri: Platform.OS === 'android' ? reportImage.uri : reportImage.uri.replace('file://', ''),
            type: reportImage.type,
            name: reportImage.fileName,
        });

        try {
            const response = await fetch(`${API_BASE}/api/v1/report`, {
                method: "POST",
                headers: { 'Content-Type': 'multipart/form-data' },
                body: formPayload,
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.detail || result.error || "Submission failed");
            
            Alert.alert("Success", "Medical report uploaded successfully!");
            setFormData({ fasting_sugar: "", random_sugar: "", cholesterol: "", hcg: "", reportImage: null });
            fetchReportData();
        } catch (error) {
            Alert.alert("Submission Error", error.message);
        }
    };
    
    useEffect(() => { fetchReportData(); }, [fetchReportData]);

    if (loading) {
        return (
            <>
                <Header user={user} setUser={setUser} />
                <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#4A90E2" /></View>
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
                data={[...reportData].reverse()}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                ListHeaderComponent={
                    <ListHeader
                        data={reportData}
                        formData={formData}
                        setFormData={setFormData}
                        handleImagePick={handleImagePick}
                        submitReport={submitReport}
                    />
                }
                renderItem={({ item }) => (
                    <View style={styles.tableRowWrapper}>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, { flex: 2 }]}>{new Date(item.created_at).toLocaleDateString()}</Text>
                            <Text style={styles.tableCell}>{item.fasting_sugar}</Text>
                            <Text style={styles.tableCell}>{item.random_sugar}</Text>
                            <Text style={styles.tableCell}>{item.cholesterol}</Text>
                            <View style={styles.tableCell}>
                                {item.image_url && <Image source={{ uri: item.image_url }} style={styles.tableThumbnail} />}
                            </View>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.card}><Text style={styles.noDataText}>No reports found.</Text></View>
                }
            />
        </>
    );
}

// ============================================
// SUB-COMPONENTS & STYLES (Mostly unchanged)
// ============================================
const StatCard = ({ label, value, unit, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>{value} <Text style={styles.statUnit}>{unit}</Text></Text>
    </View>
);
const ReportStats = ({ data }) => {
    const averages = data.reduce((acc, item) => ({
        fasting_sugar: acc.fasting_sugar + (parseFloat(item.fasting_sugar) || 0),
        random_sugar: acc.random_sugar + (parseFloat(item.random_sugar) || 0),
        cholesterol: acc.cholesterol + (parseFloat(item.cholesterol) || 0),
        count: acc.count + 1,
    }), { fasting_sugar: 0, random_sugar: 0, cholesterol: 0, count: 0 });

    const getAvg = (total) => averages.count ? (total / averages.count).toFixed(0) : "N/A";

    return (
        <View style={styles.statsGrid}>
            <StatCard label="Avg Fasting Sugar" value={getAvg(averages.fasting_sugar)} unit="mg/dL" color="#EF4444" />
            <StatCard label="Avg Random Sugar" value={getAvg(averages.random_sugar)} unit="mg/dL" color="#FACC15" />
            <StatCard label="Avg Cholesterol" value={getAvg(averages.cholesterol)} unit="mg/dL" color="#10B981" />
        </View>
    );
};
const FormInput = ({ label, ...props }) => (
    <View style={styles.formGroup}>
        <Text style={styles.label}>{label}</Text>
        <TextInput style={styles.input} keyboardType="numeric" placeholderTextColor="#9ca3af" {...props} />
    </View>
);
const ImagePicker = ({ onPick, image }) => (
    <View style={styles.formGroupFull}>
        <Text style={styles.label}>Report Image *</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={onPick}>
            {image ? (
                <Image source={{ uri: image.uri }} style={styles.previewImg} />
            ) : (
                <Text style={styles.imagePickerText}>Tap to select an image</Text>
            )}
        </TouchableOpacity>
    </View>
);
const ReportChart = ({ data }) => {
    const chartData = {
        labels: data.map(item => new Date(item.created_at).toLocaleDateString()),
        datasets: [
            { data: data.map(item => parseFloat(item.fasting_sugar)), color: () => "#EF4444", strokeWidth: 2 },
            { data: data.map(item => parseFloat(item.random_sugar)), color: () => "#FACC15", strokeWidth: 2 },
            { data: data.map(item => parseFloat(item.cholesterol)), color: () => "#10B981", strokeWidth: 2 },
        ],
        legend: ["Fasting Sugar", "Random Sugar", "Cholesterol"]
    };
    return <LineChart data={chartData} width={screenWidth - 64} height={220} chartConfig={chartConfig} bezier style={styles.chart} />;
};

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
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    statCard: { backgroundColor: '#fff', borderRadius: 8, padding: 12, flex: 1, marginHorizontal: 4, elevation: 1, borderLeftWidth: 4 },
    statLabel: { fontSize: 12, color: '#6b7280' },
    statValue: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
    statUnit: { fontSize: 12, fontWeight: 'normal' },
    formGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    formGroup: { width: '48%', marginBottom: 12 },
    formGroupFull: { width: '100%', marginBottom: 12 },
    label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
    input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16 },
    imagePicker: { height: 120, borderWidth: 2, borderColor: '#d1d5db', borderStyle: 'dashed', borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
    imagePickerText: { color: '#6b7280' },
    previewImg: { width: '100%', height: '100%', borderRadius: 6 },
    submitBtn: { backgroundColor: '#4A90E2', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
    submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    noDataText: { textAlign: 'center', color: '#9ca3af', paddingVertical: 20 },
    chart: { borderRadius: 8, marginVertical: 8 },
    tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e5e7eb', paddingBottom: 8, marginBottom: 8 },
    tableRowWrapper: { backgroundColor: '#fff', marginHorizontal: -16, paddingHorizontal: 16 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#f3f4f6', paddingVertical: 12, alignItems: 'center' },
    tableCell: { flex: 1, fontSize: 14, color: '#374151', textAlign: 'center' },
    tableHeaderText: { fontWeight: 'bold', color: '#6b7280', fontSize: 12 },
    tableThumbnail: { width: 40, height: 40, borderRadius: 4 },
});