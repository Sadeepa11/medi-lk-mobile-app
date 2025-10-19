import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Host } from "react-native-portalize";

// Screens
import LoginScreen from "./screens/LoginScreen";
import SplashScreen from "./screens/SplashScreen";
import CreateProfileScreen from "./screens/CreateProfileScreen";
import UpdateProfileScreen from "./screens/UpdateProfile";
import SugarAndCholesterol from "./screens/SugarAndCholesterol.js";
import Ear from "./screens/Ear";
import Eye from "./screens/Eye";
import Lab from "./screens/Lab";
import Prescription from "./screens/Prescription";
import Dietary from "./screens/Dietary";
import Device from "./screens/Device";
import About from "./screens/About";
import Contact from "./screens/Contact";
import BMI from "./screens/BMI";
import Home from "./screens/Home";
import Dashboard from "./screens/Dashboard"; 

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Google SignIn configuration
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "233200357529-0aeho3lonj6jbcle6fj7ci1vikgha08a.apps.googleusercontent.com",
      scopes: ["profile", "email"],
    });
  }, []);

  // Load user from AsyncStorage on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.log("Failed to load user from storage", e);
      } finally {
        setLoadingUser(false);
      }
    };
    loadUser();
  }, []);

  // Show a splash screen while checking for user data
  if (loadingUser) {
    return <SplashScreen />;
  }

  return (
    <Host>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            // --- MAIN APP STACK (User is logged in) ---
            <Stack.Group>
              {/* ✅ Home is the initial screen */}
              <Stack.Screen name="Home">
                {(props) => <Home {...props} user={user} setUser={setUser} />}
              </Stack.Screen>

             

              <Stack.Screen name="BMI">
                {(props) => <BMI {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen name="UpdateProfile">
                {(props) => <UpdateProfileScreen {...props} user={user} setUser={setUser} />}
              </Stack.Screen>
              {/* This can point to Home or Dashboard as you prefer */}
              <Stack.Screen name="WaterInOut">
                {(props) => <Dashboard {...props} user={user} setUser={setUser} />}
              </Stack.Screen>
              <Stack.Screen name="SugarAndCholesterol">
                {(props) => <SugarAndCholesterol {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen name="Ear">
                {(props) => <Ear {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen name="Eye">
                {(props) => <Eye {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen name="Lab">
                {(props) => <Lab {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen name="Prescription">
                {(props) => <Prescription {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen name="Dietary">
                {(props) => <Dietary {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen name="Device">
                {(props) => <Device {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen name="About">
                {(props) => <About {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen name="Contact">
                {(props) => <Contact {...props} user={user} />}
              </Stack.Screen>
            </Stack.Group>
          ) : (
            // --- AUTH STACK (User is not logged in) ---
            <Stack.Group>
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Login">
                {(props) => <LoginScreen {...props} setUser={setUser} />}
              </Stack.Screen>
              <Stack.Screen name="CreateProfile">
                {(props) => <CreateProfileScreen {...props} setUser={setUser} />}
              </Stack.Screen>
              <Stack.Screen name="Home">
                {(props) => <Home {...props} user={user} setUser={setUser} />}
              </Stack.Screen>
            </Stack.Group>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </Host>
  );
}

