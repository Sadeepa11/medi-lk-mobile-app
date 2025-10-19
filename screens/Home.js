import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
    Platform,
    ScrollView,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import DateTimePicker from "@react-native-community/datetimepicker";
import Header from "../components/Header"; // Assuming Header is in this path

const API_BASE = "https://nearyala.lk";
const screenWidth = Dimensions.get("window").width;

// Helper to format dates
const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "N/A");

const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 1,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    propsForDots: { r: "4", strokeWidth: "2" },
};

// ============================================
// SEPARATE CHART COMPONENTS (Unchanged)
// ============================================
const FastingSugarChart = ({ data }) => {
    const chartData = {
        labels: data.map(d => formatDate(d.created_at)),
        datasets: [{ data: data.map(d => parseFloat(d.fasting_sugar) || 0) }],
    };
    return (
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>🩸 Fasting Sugar Trend</Text>
            {data.length > 0 ? (
                <LineChart data={chartData} width={screenWidth - 64} height={220} chartConfig={{ ...chartConfig, color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})` }} bezier style={styles.chart}/>
            ) : (
                <Text style={styles.noDataText}>No data for selected period.</Text>
            )}
        </View>
    );
};
const RandomSugarChart = ({ data }) => {
    const chartData = {
        labels: data.map(d => formatDate(d.created_at)),
        datasets: [{ data: data.map(d => parseFloat(d.random_sugar) || 0) }],
    };
    return (
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>🍭 Random Sugar Trend</Text>
            {data.length > 0 ? (
                <LineChart data={chartData} width={screenWidth - 64} height={220} chartConfig={{ ...chartConfig, color: (opacity = 1) => `rgba(250, 204, 21, ${opacity})` }} bezier style={styles.chart}/>
            ) : (
                <Text style={styles.noDataText}>No data for selected period.</Text>
            )}
        </View>
    );
};
const CholesterolChart = ({ data }) => {
    const chartData = {
        labels: data.map(d => formatDate(d.created_at)),
        datasets: [{ data: data.map(d => parseFloat(d.cholesterol) || 0) }],
    };
    return (
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>❤️ Total Cholesterol Trend</Text>
            {data.length > 0 ? (
                <LineChart data={chartData} width={screenWidth - 64} height={220} chartConfig={{ ...chartConfig, color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})` }} bezier style={styles.chart}/>
            ) : (
                <Text style={styles.noDataText}>No data for selected period.</Text>
            )}
        </View>
    );
};
const BmiChart = ({ data }) => {
    const chartData = {
        labels: data.map(d => formatDate(d.timestamp)),
        datasets: [{ data: data.map(d => parseFloat(d.bmi) || 0) }],
    };
    return (
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>⚖️ BMI Trend</Text>
            {data.length > 0 ? (
                <LineChart data={chartData} width={screenWidth - 64} height={220} chartConfig={{ ...chartConfig, color: (opacity = 1) => `rgba(66, 133, 244, ${opacity})` }} bezier style={styles.chart}/>
            ) : (
                <Text style={styles.noDataText}>No data for selected period.</Text>
            )}
        </View>
    );
};

// ============================================
// NEW FILTER BUTTONS COMPONENT
// ============================================
const FilterButtons = ({ activeFilter, onFilterChange }) => {
    const filters = ["Today", "Yesterday", "Week", "Month", "Custom"];
    return (
        <View style={styles.filterButtonsContainer}>
            {filters.map(filter => (
                <TouchableOpacity
                    key={filter}
                    style={[styles.filterButton, activeFilter === filter.toLowerCase() && styles.activeFilterButton]}
                    onPress={() => onFilterChange(filter.toLowerCase())}
                >
                    <Text style={[styles.filterButtonText, activeFilter === filter.toLowerCase() && styles.activeFilterButtonText]}>
                        {filter}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

// ============================================
// PARENT HOME SCREEN COMPONENT
// ============================================
export default function Home({ user, setUser }) {
    const [labData, setLabData] = useState([]);
    const [bmiData, setBmiData] = useState([]);
    const [filteredLabData, setFilteredLabData] = useState([]);
    const [filteredBmiData, setFilteredBmiData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Date filter state
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [activeFilter, setActiveFilter] = useState('week'); // Default filter
    const [isCustomPickerVisible, setCustomPickerVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [activeDatePicker, setActiveDatePicker] = useState(null); // 'start' or 'end'

    const fetchData = useCallback(async () => {
        if (!user?.user_uid && !user?.id) return;
        setLoading(true);
        try {
            const [labResponse, bmiResponse] = await Promise.all([
                fetch(`${API_BASE}/api/v1/report/${user.user_uid}`),
                fetch(`${API_BASE}/api/v1/bmi/${user.id}`),
            ]);

            if (labResponse.ok) setLabData((await labResponse.json()).data?.data || []);
            if (bmiResponse.ok) setBmiData((await bmiResponse.json()).data || []);

        } catch (e) {
            console.error("Dashboard data fetch error:", e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Initial data fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filtering logic effect
    useEffect(() => {
        const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
        const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

        const filterAndSort = (data, dateKey) =>
            data
            .filter(item => {
                const itemDate = new Date(item[dateKey]);
                if (start && itemDate < start) return false;
                if (end && itemDate > end) return false;
                return true;
            })
            .sort((a, b) => new Date(a[dateKey]) - new Date(b[dateKey]));

        setFilteredLabData(filterAndSort(labData, 'created_at'));
        setFilteredBmiData(filterAndSort(bmiData, 'timestamp'));
    }, [labData, bmiData, startDate, endDate]);

    // Effect to set date range based on active filter
    useEffect(() => {
        const end = new Date();
        let start = new Date();
        end.setHours(23, 59, 59, 999);

        switch (activeFilter) {
            case 'today':
                start.setHours(0, 0, 0, 0);
                break;
            case 'yesterday':
                start.setDate(start.getDate() - 1);
                start.setHours(0, 0, 0, 0);
                end.setDate(end.getDate() - 1);
                break;
            case 'week':
                start.setDate(start.getDate() - start.getDay()); // Assuming week starts on Sunday
                start.setHours(0, 0, 0, 0);
                break;
            case 'month':
                start.setDate(1);
                start.setHours(0, 0, 0, 0);
                break;
            case 'custom':
                // For custom, we don't set dates here; they are set by the picker.
                return;
        }
        setStartDate(start);
        setEndDate(end);
    }, [activeFilter]);
    
    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        setCustomPickerVisible(filter === 'custom');
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            if (activeDatePicker === 'start') {
                setStartDate(selectedDate);
            } else {
                setEndDate(selectedDate);
            }
        }
        setActiveDatePicker(null);
    };

    const showPicker = (type) => {
        setActiveDatePicker(type);
        setShowDatePicker(true);
    };

    return (
        <>
            <Header user={user} setUser={setUser} />
            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#4A90E2" />
                </View>
            ) : (
                <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                    <Text style={styles.pageTitle}>🏠 Home</Text>
                    
                    <View style={[styles.card, styles.filterCard]}>
                        <Text style={styles.sectionTitle}>Filter by Date</Text>
                        <FilterButtons activeFilter={activeFilter} onFilterChange={handleFilterChange} />
                        {isCustomPickerVisible && (
                            <View style={styles.datePickerContainer}>
                                <TouchableOpacity onPress={() => showPicker('start')} style={styles.datePickerBtn}>
                                    <Text style={styles.datePickerLabel}>Start Date</Text>
                                    <Text style={styles.datePickerText}>{formatDate(startDate) || 'Select'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => showPicker('end')} style={styles.datePickerBtn}>
                                    <Text style={styles.datePickerLabel}>End Date</Text>
                                    <Text style={styles.datePickerText}>{formatDate(endDate) || 'Select'}</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <FastingSugarChart data={filteredLabData} />
                    <RandomSugarChart data={filteredLabData} />
                    <CholesterolChart data={filteredLabData} />
                    <BmiChart data={filteredBmiData} />
                </ScrollView>
            )}

            {showDatePicker && (
                <DateTimePicker
                    value={activeDatePicker === 'start' ? (startDate || new Date()) : (endDate || new Date())}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                />
            )}
        </>
    );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f3f4f6" },
    content: { padding: 16 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#f3f4f6" },
    pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
    noDataText: { textAlign: 'center', color: '#9ca3af', paddingVertical: 32 },
    chart: { borderRadius: 8, marginVertical: 8 },
    filterCard: { backgroundColor: '#eef2ff' },
    // ✅ Filter Buttons Styles
    filterButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap' },
    filterButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#d1d5db' },
    activeFilterButton: { backgroundColor: '#4A90E2' },
    filterButtonText: { fontWeight: '600', color: '#4b5563' },
    activeFilterButtonText: { color: '#fff' },
    // Custom Date Picker Styles
    datePickerContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 },
    datePickerBtn: { flex: 1, padding: 12, backgroundColor: '#fff', borderRadius: 8, alignItems: 'center', marginHorizontal: 8 },
    datePickerLabel: { fontSize: 12, color: '#6b7280' },
    datePickerText: { fontSize: 16, fontWeight: '500', color: '#374151', marginTop: 4 },
});

