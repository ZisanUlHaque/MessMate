import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { COLORS, FONT_SIZE } from "@/lib/constants";

export interface BadgeProps {
  label: string;
  variant?: "success" | "warning" | "danger" | "info" | "default";
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "default",
  style,
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case "success":
        return COLORS.success;
      case "warning":
        return COLORS.warning;
      case "danger":
        return COLORS.danger;
      case "info":
        return COLORS.primary;
      case "default":
      default:
        return COLORS.textSecondary;
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getBackgroundColor() }, style]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
