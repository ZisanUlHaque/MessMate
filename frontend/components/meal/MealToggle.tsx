import React, { useRef, useEffect } from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  View,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { COLORS, FONT_SIZE, BORDER_RADIUS } from "@/lib/constants";

export interface MealToggleProps {
  mealType: "breakfast" | "lunch" | "dinner";
  isActive: boolean;
  isLocked?: boolean;
  onToggle: () => void;
}

const MEAL_CONFIG = {
  breakfast: { emoji: "🌅", label: "Breakfast" },
  lunch: { emoji: "☀️", label: "Lunch" },
  dinner: { emoji: "🌙", label: "Dinner" },
};

export const MealToggle: React.FC<MealToggleProps> = ({
  mealType,
  isActive,
  isLocked = false,
  onToggle,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const config = MEAL_CONFIG[mealType];

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.08,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive]);

  const handlePress = async () => {
    if (isLocked) return;
    try {
      if (!isActive) {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {
      // Haptic fallback
    }
    onToggle();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Pressable
        onPress={handlePress}
        disabled={isLocked}
        style={[
          styles.button,
          isActive ? styles.activeButton : styles.inactiveButton,
          isLocked && styles.lockedButton,
        ]}
      >
        <Text style={styles.emoji}>{config.emoji}</Text>
        <Text
          style={[
            styles.label,
            isActive ? styles.activeLabel : styles.inactiveLabel,
          ]}
        >
          {config.label}
        </Text>

        {isActive ? (
          <View style={styles.checkOverlay}>
            <Ionicons name="checkmark-circle" size={22} color={COLORS.white} />
          </View>
        ) : null}

        {isLocked ? (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={18} color={COLORS.danger} />
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: 90,
    height: 90,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    position: "relative",
    borderWidth: 1.5,
  },
  activeButton: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  inactiveButton: {
    backgroundColor: COLORS.divider,
    borderColor: COLORS.border,
  },
  lockedButton: {
    opacity: 0.65,
    backgroundColor: "#F3F4F6",
    borderColor: COLORS.border,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
  },
  activeLabel: {
    color: COLORS.white,
  },
  inactiveLabel: {
    color: COLORS.textSecondary,
  },
  checkOverlay: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  lockOverlay: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 2,
  },
});
