import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { COLORS } from "@/lib/constants";

export default function SplashScreen() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (isAuthenticated) {
          router.replace("/(tabs)/home");
        } else {
          router.replace("/(auth)/login");
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading]);

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Text style={styles.logoEmoji}>🍽️</Text>
        <Text style={styles.brandTitle}>MessMate</Text>
        <Text style={styles.brandTagline}>Smart Bachelor Mess Manager</Text>
      </View>

      <View style={styles.bottomContent}>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 64,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 8,
    fontWeight: "500",
  },
  bottomContent: {
    paddingBottom: 24,
  },
});
