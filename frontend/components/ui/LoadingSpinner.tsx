import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { COLORS, FONT_SIZE } from "@/lib/constants";

export interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
  size?: "small" | "large";
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  message,
  size = "large",
  color = COLORS.primary,
}) => {
  if (fullScreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <ActivityIndicator size={size} color={color} />
        {message ? <Text style={styles.messageText}>{message}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.inlineContainer}>
      <ActivityIndicator size={size} color={color} />
      {message ? <Text style={styles.inlineMessage}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  inlineContainer: {
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  messageText: {
    marginTop: 12,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  inlineMessage: {
    marginTop: 8,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
});
