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
import { launchImageLibrary } from 'react-native-image-picker';
import Header from "../components/Header";

const API_BASE = "https://nearyala.lk";

// ============================================
// HEADER COMPONENT (DEFINED EXTERNALLY)
// ============================================

const ListHeader = ({ data, formData, handleImagePick, submitFoodIntake, setFormData }) => (
    <>
        <Text style={styles.pageTitle}>🍽️ Dietary Tracker</Text>
        <NutritionSummary data={data} />
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Record New Food Intake</Text>
            <View style={styles.formGrid}>
                <FormInput label="Carbs (g)" value={formData.carbohydrates} onChangeText={(t) => setFormData(p => ({...p, carbohydrates: t}))} />
                <FormInput label="Protein (g)" value={formData.protein} onChangeText={(t) => setFormData(p => ({...p, protein: t}))} />
                <FormInput label="Fat (g)" value={formData.fat} onChangeText={(t) => setFormData(p => ({...p, fat: t}))} />
                <FormInput label="Vitamins (mg)" value={formData.vitamins} onChangeText={(t) => setFormData(p => ({...p, vitamins: t}))} />
                <FormInput label="Minerals (mg)" value={formData.minerals} onChangeText={(t) => setFormData(p => ({...p, minerals: t}))} />
            </View>
            <ImagePicker onPick={handleImagePick} image={formData.foodImage} />
            <TouchableOpacity style={styles.submitBtn} onPress={submitFoodIntake}>
                <Text style={styles.submitBtnText}>📤 Submit Food Intake</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Food Intake Records</Text>
            <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 2 }]}>Date</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>Carbs</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>Protein</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>Fat</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>Image</Text>
            </View>
        </View>
    </>
);

// ============================================
// MAIN DIETARY SCREEN COMPONENT
// ============================================
export default function Dietary({ user, setUser }) {
    const [foodData, setFoodData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        carbohydrates: "",
        protein: "",
        fat: "",
        vitamins: "",
        minerals: "",
        foodImage: null,
    });

    const fetchFoodData = useCallback(async () => {
        if (!user?.user_uid) return;
        setLoading(true);
        try {
            const url = `${API_BASE}/api/v1/food/${user.user_uid}`;
            const response = await fetch(url);
            if (response.status === 404) {
                setFoodData([]);
                return;
            }
            if (!response.ok) throw new Error("Failed to fetch data");
            
            const result = await response.json();
            let dataArray = result.data?.data || result.data || (Array.isArray(result) ? result : []);
            setFoodData(dataArray);
        } catch (e) {
            console.error("Fetch food data error:", e);
            Alert.alert("Error", "Could not fetch dietary data.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    const handleImagePick = () => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.didCancel) return;
            if (response.errorCode) return Alert.alert('ImagePicker Error', response.errorMessage);
            if (response.assets?.length > 0) {
                setFormData(prev => ({ ...prev, foodImage: response.assets[0] }));
            }
        });
    };

    const submitFoodIntake = async () => {
        const { foodImage, ...otherFields } = formData;
        if (Object.values(otherFields).some(field => !field) || !foodImage) {
            return Alert.alert("Missing Fields", "Please fill all fields and upload an image.");
        }

        const formPayload = new FormData();
        formPayload.append("user_uid", user.user_uid);
        Object.keys(otherFields).forEach(key => formPayload.append(key, otherFields[key]));

        formPayload.append('food_image', {
            uri: Platform.OS === 'android' ? foodImage.uri : foodImage.uri.replace('file://', ''),
            type: foodImage.type,
            name: foodImage.fileName,
        });

        try {
            const response = await fetch(`${API_BASE}/api/v1/food`, {
                method: "POST",
                headers: { 'Content-Type': 'multipart/form-data' },
                body: formPayload,
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Unknown error");
            }
            Alert.alert("Success", "Food intake recorded successfully!");
            setFormData({ carbohydrates: "", protein: "", fat: "", vitamins: "", minerals: "", foodImage: null });
            fetchFoodData();
        } catch (error) {
            Alert.alert("Submission Error", error.message);
        }
    };
    
    useEffect(() => {
        fetchFoodData();
    }, [fetchFoodData]);

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
                data={[...foodData].reverse()}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                ListHeaderComponent={
                    <ListHeader
                        data={foodData}
                        formData={formData}
                        setFormData={setFormData}
                        handleImagePick={handleImagePick}
                        submitFoodIntake={submitFoodIntake}
                    />
                }
                renderItem={({ item }) => (
                    <View style={styles.tableRowWrapper}>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, { flex: 2 }]}>{new Date(item.created_at).toLocaleDateString()}</Text>
                            <Text style={styles.tableCell}>{item.carbohydrates}</Text>
                            <Text style={styles.tableCell}>{item.protein}</Text>
                            <Text style={styles.tableCell}>{item.fat}</Text>
                            <View style={styles.tableCell}>
                                {item.image_url && <Image source={{ uri: item.image_url }} style={styles.tableThumbnail} />}
                            </View>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.card}><Text style={styles.noDataText}>No records found.</Text></View>
                }
            />
        </>
    );
}

// ============================================
// SUB-COMPONENTS
// ============================================
const StatCard = ({ label, value, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
);
const NutritionSummary = ({ data }) => {
    const sums = data.reduce(
        (acc, item) => ({
            carbohydrates: acc.carbohydrates + (parseFloat(item.carbohydrates) || 0),
            protein: acc.protein + (parseFloat(item.protein) || 0),
            fat: acc.fat + (parseFloat(item.fat) || 0),
        }), { carbohydrates: 0, protein: 0, fat: 0 }
    );
    return (
        <View style={styles.statsGrid}>
            <StatCard label="Total Carbs (g)" value={sums.carbohydrates.toFixed(1)} color="#FF6B6B" />
            <StatCard label="Total Protein (g)" value={sums.protein.toFixed(1)} color="#4ECDC4" />
            <StatCard label="Total Fat (g)" value={sums.fat.toFixed(1)} color="#FFD93D" />
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
        <Text style={styles.label}>Food Image *</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={onPick}>
            {image ? (
                <Image source={{ uri: image.uri }} style={styles.previewImg} />
            ) : (
                <Text style={styles.imagePickerText}>Tap to select an image</Text>
            )}
        </TouchableOpacity>
    </View>
);

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f3f4f6" },
    content: { padding: 16 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    statCard: { backgroundColor: '#fff', borderRadius: 8, padding: 12, flex: 1, marginHorizontal: 4, elevation: 1, borderLeftWidth: 4 },
    statLabel: { fontSize: 14, color: '#6b7280' },
    statValue: { fontSize: 22, fontWeight: 'bold', marginTop: 4 },
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
    tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e5e7eb', paddingBottom: 8, marginBottom: 8 },
    tableRowWrapper: { backgroundColor: '#fff', marginHorizontal: -16, paddingHorizontal: 16 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#f3f4f6', paddingVertical: 12, alignItems: 'center' },
    tableCell: { flex: 1, fontSize: 14, color: '#374151', textAlign: 'center' },
    tableHeaderText: { fontWeight: 'bold', color: '#6b7280', fontSize: 12 },
    tableThumbnail: { width: 40, height: 40, borderRadius: 4 },
});