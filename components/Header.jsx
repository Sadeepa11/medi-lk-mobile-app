import React, { useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  Pressable,
  StatusBar,
  ScrollView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// The Header now accepts setUser directly to handle the sign-out action globally.
export default function Header({ user, setUser }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ 1. Centralized Sign-Out Logic
  // This function can now be called from anywhere inside this component.
  const handleSignOut = async () => {
    try {
      setMenuOpen(false); // Close menu first
      await GoogleSignin.signOut();
      await AsyncStorage.removeItem('user');
      setUser(null); // This will trigger the navigation change in App.js
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.userInfo}>
          {/* ✅ 2. Corrected user prop from .picture to .photo */}
          {user?.photo && (
            <Image source={{ uri: user.photo }} style={styles.avatar} />
          )}
          <View>
            <Text style={styles.userName} numberOfLines={1}>{user.name || user.username}</Text>
            <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setMenuOpen(true)} // Open the modal
          style={styles.menuBtn}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        {/* ✅ 3. Improved Menu using a Modal for better UX */}
        <Modal
          visible={menuOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setMenuOpen(false)} // For Android back button
        >
          <Pressable 
            style={styles.modalOverlay} 
            onPress={() => setMenuOpen(false)} // Tap outside to close
          >
            <Pressable>
              <HeaderMenu 
                setMenuOpen={setMenuOpen}
                handleSignOut={handleSignOut} // Pass our new sign-out function
              />
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </View>
  );
}

function HeaderMenu({ setMenuOpen, handleSignOut }) {
  const navigation = useNavigation();

  const menuItems = [
    { label: "Home", route: "Home", icon: "🏠" },
    { label: "My Profile", route: "UpdateProfile", icon: "👤" },
    { label: "Water In-Out", route: "WaterInOut", icon: "💧" },
    { label: "BMI Calculator", route: "BMI", icon: "⚖️" },
    { label: "Sugar / Cholesterol", route: "SugarAndCholesterol", icon: "🩸" },
    { label: "Ear Records", route: "Ear", icon: "👂" },
    { label: "Eye Records", route: "Eye", icon: "👁️" },
    { label: "Lab Reports", route: "Lab", icon: "🔬" },
    { label: "Prescriptions", route: "Prescription", icon: "💊" },
    { label: "Dietary Plans", route: "Dietary", icon: "🥗" },
    { label: "My Device", route: "Device", icon: "💻" },
    { label: "About Us", route: "About", icon: "ℹ️" },
    { label: "Contact Us", route: "Contact", icon: "📞" },
  ];

  const handleNavigate = (route) => {
    setMenuOpen(false);
    navigation.navigate(route);
  };

  return (
    // The menu content is now scrollable
    <View style={styles.dropdown}>
      <ScrollView>
        {menuItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.dropdownItem}
            onPress={() => handleNavigate(item.route)}
          >
            <Text style={styles.dropdownIcon}>{item.icon}</Text>
            <Text style={styles.dropdownText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
        
        <View style={styles.divider} />

        <TouchableOpacity onPress={handleSignOut} style={styles.dropdownItem}>
          <Text style={styles.dropdownIcon}>🚪</Text>
          <Text style={[styles.dropdownText, { color: '#D32F2F' }]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingTop: StatusBar.currentHeight, // Safe area for Android status bar
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1, // Allow userInfo to take available space
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#4285F4",
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  userEmail: {
    fontSize: 12,
    color: "#6b7280",
  },
  menuBtn: {
    padding: 8,
    borderRadius: 20,
  },
  menuIcon: {
    fontSize: 24,
    color: '#374151',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'flex-end',
  },
  dropdown: {
    // ✅ 4. Improved positioning, accounts for status bar
    marginTop: (StatusBar.currentHeight || 0) + 60,
    marginRight: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    width: 240,
    maxHeight: '80%', // Ensure menu doesn't go off-screen
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  dropdownIcon: {
    fontSize: 18,
  },
  dropdownText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
    marginHorizontal: 16,
  },
});