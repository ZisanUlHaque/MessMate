import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PaperProvider, MD3LightTheme, Snackbar } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { COLORS } from "@/lib/constants";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.success,
    error: COLORS.danger,
  },
};

export default function RootLayout() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const snackbar = useUIStore((state) => state.snackbar);
  const hideSnackbar = useUIStore((state) => state.hideSnackbar);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const getSnackbarColor = () => {
    switch (snackbar.type) {
      case "success":
        return COLORS.success;
      case "error":
        return COLORS.danger;
      case "info":
      default:
        return COLORS.text;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={paperTheme}>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <View style={styles.container}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="mess/create" />
              <Stack.Screen name="mess/join" />
              <Stack.Screen name="mess/[id]" />
              <Stack.Screen name="bazar/add" />
              <Stack.Screen name="bazar/[id]" />
              <Stack.Screen name="bill/[id]" />
            </Stack>

            <Snackbar
              visible={snackbar.visible}
              onDismiss={hideSnackbar}
              duration={3000}
              style={[
                styles.snackbar,
                { backgroundColor: getSnackbarColor() },
              ]}
              action={{
                label: "Dismiss",
                textColor: COLORS.white,
                onPress: hideSnackbar,
              }}
            >
              {snackbar.message}
            </Snackbar>
          </View>
        </SafeAreaProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  snackbar: {
    zIndex: 9999,
  },
});
