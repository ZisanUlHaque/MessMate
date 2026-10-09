import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONT_SIZE, BORDER_RADIUS } from "@/lib/constants";

export interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="alert-circle" size={20} color={COLORS.danger} style={styles.icon} />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>
      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.dangerLight,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  icon: {
    marginRight: 8,
  },
  message: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.sm,
    fontWeight: "500",
    flex: 1,
  },
  retryButton: {
    backgroundColor: COLORS.danger,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  retryText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
  },
});
