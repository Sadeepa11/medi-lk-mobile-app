import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, StyleSheet, Dimensions, Alert } from "react-native";
import { LineChart } from "react-native-chart-kit";
import Header from "../components/Header";

// ✅ Define API_BASE for consistency
const API_BASE = "https://nearyala.lk";

export default function Dashboard({ user, setUser }) {
  const [waterIn, setWaterIn] = useState("");
  const [urineOut, setUrineOut] = useState("");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filter, setFilter] = useState("today");
  const [customDate, setCustomDate] = useState(new Date().toISOString().split("T")[0]);

  const screenWidth = Dimensions.get("window").width - 32;

  // Stats calculation (no changes needed here)
  const stats = filteredData.reduce(
    (acc, item) => ({
      totalWaterIn: acc.totalWaterIn + item.water_in,
      totalUrineOut: acc.totalUrineOut + item.water_out,
      balance: acc.totalWaterIn + item.water_in - (acc.totalUrineOut + item.water_out),
    }),
    { totalWaterIn: 0, totalUrineOut: 0, balance: 0 }
  );

  // ✅ UPDATED: submitWaterIn now uses dynamic user ID
  const submitWaterIn = async () => {
    if (!waterIn) return Alert.alert("Missing Value", "Please enter Water In value");
    if (!user?.user_uid) return Alert.alert("Error", "User not identified.");

    const waterUrl = `${API_BASE}/api/v1/data?value=IN(${waterIn})%2COUT(0)%2C${user.user_uid}`;

    try {
      await fetch(waterUrl);
      Alert.alert("Success", "✅ Water In Sent!");
      setWaterIn("");
      fetchData(); // Refresh data after submission
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "❌ Failed to send Water In");
    }
  };

  // ✅ UPDATED: submitUrineOut now uses dynamic user ID
  const submitUrineOut = async () => {
    if (!urineOut) return Alert.alert("Missing Value", "Please enter Urine Out value");
    if (!user?.user_uid) return Alert.alert("Error", "User not identified.");
    
    const urineUrl = `${API_BASE}/api/v1/data?value=IN(0)%2COUT(${urineOut})%2C${user.user_uid}`;

    try {
      await fetch(urineUrl);
      Alert.alert("Success", "✅ Urine Out Sent!");
      setUrineOut("");
      fetchData(); // Refresh data after submission
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "❌ Failed to send Urine Out");
    }
  };

  // ✅ UPDATED: fetchData is now robust and user-specific
 // Corrected fetchData function
const fetchData = async () => {
    // ✅ CORRECTED: Check for user.user_uid directly

    console.log(user);
    
    
    if (!user?.user_uid) {
    
      
        console.log("Waiting for user ID...");
        return; // Don't fetch if there's no user ID
    }

    try {
        // This fetch call is already correct
        const response = await fetch(`${API_BASE}/api/v1/data/user/${user.user_uid}`);
        
        if (response.status === 200) {
            const result = await response.json();
            const dataArray = result.data || result;
            setData(Array.isArray(dataArray) ? dataArray : []);
        } else if (response.status === 404) {
            console.log("No data found for this user yet.");
            setData([]);
        } else {
            throw new Error(`Server responded with status: ${response.status}`);
        }
    } catch (e) {
        console.log("Fetch error:", e);
        Alert.alert("Fetch Error", "Could not retrieve your data. Please try again later.");
    }
};

  const filterData = (allData, range, customDateValue) => {
    // This function logic remains the same
    const now = new Date();
    let startDate, endDate;

    switch (range) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date();
        break;
      case "yesterday":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "week":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date();
        break;
      case "month":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        endDate = new Date();
        break;
      case "custom":
        if (customDateValue) {
          const cDate = new Date(customDateValue);
          startDate = new Date(cDate.setHours(0, 0, 0, 0));
          endDate = new Date(cDate.setHours(23, 59, 59, 999));
        } else {
          startDate = new Date(now.setHours(0, 0, 0, 0));
          endDate = new Date();
        }
        break;
      default:
        startDate = new Date(0);
        endDate = new Date();
    }

    const filtered = allData.filter((item) => {
      const d = new Date(item.timestamp);
      return d >= startDate && d <= endDate;
    });

    setFilteredData(filtered);
  };
  
  // ✅ UPDATED: useEffect now depends on `user`
  // This ensures fetchData runs when the user object is loaded/changed.
  useEffect(() => {
    fetchData(); // Fetch initial data
    const interval = setInterval(fetchData, 30000); // Set up polling
    return () => clearInterval(interval); // Cleanup on unmount
  }, [user]); // Re-run when user object becomes available

  // This useEffect for filtering remains the same
  useEffect(() => {
    filterData(data, filter, customDate);
  }, [filter, data, customDate]);

  // Chart data logic remains the same
  const chartGroupedData = ["today", "yesterday", "custom"].includes(filter)
    ? filteredData.map((item) => ({
      label: item.timestamp.split(" ")[1],
      waterIn: item.water_in,
      waterOut: item.water_out,
    }))
    : Object.values(
      filteredData.reduce((acc, item) => {
        const date = item.timestamp.split(" ")[0];
        if (!acc[date]) acc[date] = { label: date, waterIn: 0, waterOut: 0 };
        acc[date].waterIn += item.water_in;
        acc[date].waterOut += item.water_out;
        return acc;
      }, {})
    );

  const chartData = {
    labels: chartGroupedData.map((d) => d.label).slice(0, 5), // Limit labels to avoid clutter
    datasets: [
      {
        data: chartGroupedData.map((d) => d.waterIn),
        color: () => "#4285F4",
        strokeWidth: 2,
      },
      {
        data: chartGroupedData.map((d) => d.waterOut),
        color: () => "#FF9800",
        strokeWidth: 2,
      },
    ],
    legend: ["Water In", "Urine Out"],
  };

  if (!user) return <Text style={{ textAlign: "center", marginTop: 50 }}>Loading user info...</Text>;

  return (
    <>
      <Header user={user} setUser={setUser} />
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatCard label="Total Water In" value={stats.totalWaterIn} color="#4285F4" />
          <StatCard label="Total Urine Out" value={stats.totalUrineOut} color="#FF9800" />
          <StatCard label="Net Balance" value={stats.balance} color={stats.balance >= 0 ? "#4CAF50" : "#f44336"} />
        </View>

        {/* Inputs */}
        <View style={styles.inputGrid}>
          <InputCard
            title="Water Intake"
            value={waterIn}
            setValue={setWaterIn}
            onPress={submitWaterIn}
            color="#4285F4"
          />
          <InputCard
            title="Urine Output"
            value={urineOut}
            setValue={setUrineOut}
            onPress={submitUrineOut}
            color="#FF9800"
          />
        </View>

        {/* Filters */}
        <View style={styles.filterGrid}>
          {["today", "yesterday", "week", "month", "custom"].map((range) => (
            <TouchableOpacity key={range} onPress={() => setFilter(range)} style={[styles.filterBtn, filter === range && styles.filterBtnActive]}>
              <Text style={{ color: filter === range ? "#fff" : "#1f2937" }}>{range.charAt(0).toUpperCase() + range.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {filter === "custom" && (
          <TextInput style={styles.dateInput} value={customDate} onChangeText={setCustomDate} placeholder="YYYY-MM-DD" />
        )}

        {/* Chart */}
        <Text style={styles.sectionTitle}>Trends</Text>
        {filteredData.length > 0 && chartData.labels.length > 0 ? (
          <LineChart data={chartData} width={screenWidth} height={220} chartConfig={chartConfig} style={{ borderRadius: 16 }} />
        ) : (
          <Text style={{ textAlign: "center", marginVertical: 16, color: '#6b7280' }}>No data available for the selected period.</Text>
        )}

        {/* Table */}
        <Text style={styles.sectionTitle}>Data Log</Text>
        <View style={styles.tableHeader}>
           <Text style={styles.tableHeaderCell}>Timestamp</Text>
           <Text style={styles.tableHeaderCell}>Water In (ml)</Text>
           <Text style={styles.tableHeaderCell}>Urine Out (ml)</Text>
        </View>
        <FlatList
          scrollEnabled={false}
          data={[...filteredData].reverse()}
          keyExtractor={(item, index) => `${item.timestamp}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.timestamp}</Text>
              <Text style={[styles.tableCell, { color: "#4285F4", fontWeight: '600' }]}>{item.water_in}</Text>
              <Text style={[styles.tableCell, { color: "#FF9800", fontWeight: '600' }]}>{item.water_out}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={{textAlign: 'center', padding: 20, color: '#6b7280'}}>No entries found.</Text>}
        />
      </ScrollView>
    </>
  );
}
// Re-usable components (StatCard, InputCard) and styles remain largely the same,
// with minor additions for the table header for better UI.
// ... (rest of the component and style code)
function StatCard({ label, value, color }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={{ ...styles.statValue, color }}>{value}</Text>
    </View>
  );
}

function InputCard({ title, value, setValue, onPress, color }) {
  return (
    <View style={styles.inputCard}>
      <Text style={styles.inputLabel}>{title}</Text>
      <TextInput
        style={[styles.input, { borderColor: color }]}
        value={value}
        onChangeText={setValue}
        keyboardType="numeric"
        placeholder="Enter value in ml"
        placeholderTextColor="#9ca3af"
      />
      <TouchableOpacity style={[styles.submitBtn, { backgroundColor: color }]} onPress={onPress}>
        <Text style={{ color: "#fff", fontWeight: "600" }}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`, // Darker text for better visibility
  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: "#1f2937",
  },
  style: {
    borderRadius: 16,
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },
  statsGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24, gap: 8 },
  statCard: { flex: 1, backgroundColor: "#fff", padding: 16, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  statLabel: { fontSize: 14, color: "#6b7280" },
  statValue: { fontSize: 24, fontWeight: "700", marginTop: 4 },
  inputGrid: { gap: 16, marginBottom: 24 },
  inputCard: { backgroundColor: "#fff", padding: 16, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  inputLabel: { fontSize: 16, marginBottom: 8, fontWeight: "600", color: '#1f2937' },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  submitBtn: { padding: 12, borderRadius: 8, alignItems: "center" },
  filterGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: "#d1d5db" },
  filterBtnActive: { backgroundColor: "#4285F4", borderColor: "#4285F4" },
  dateInput: { borderWidth: 1, borderColor: "#d1d5db", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginVertical: 16, color: '#1f2937' },
  tableHeader: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "#e5e7eb", backgroundColor: '#f9fafb', paddingHorizontal: 8 },
  tableHeaderCell: { flex: 1, fontSize: 12, color: "#6b7280", fontWeight: 'bold', textTransform: 'uppercase' },
  tableRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingHorizontal: 8 },
  tableCell: { flex: 1, fontSize: 14, color: "#1f2937" },
});