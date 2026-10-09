import React, { useRef } from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import * as Haptics from "expo-haptics";
import { COLORS, BORDER_RADIUS, FONT_SIZE } from "@/lib/constants";

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!disabled && !loading) {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }).start();
    }
  };

  const handlePress = async () => {
    if (disabled || loading) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics optional fallback
    }
    onPress();
  };

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: BORDER_RADIUS.sm,
      width: fullWidth ? "100%" : undefined,
      opacity: disabled ? 0.5 : 1,
    };

    switch (size) {
      case "sm":
        baseStyle.paddingVertical = 8;
        baseStyle.paddingHorizontal = 12;
        baseStyle.minHeight = 36;
        break;
      case "lg":
        baseStyle.paddingVertical = 16;
        baseStyle.paddingHorizontal = 24;
        baseStyle.minHeight = 54;
        break;
      case "md":
      default:
        baseStyle.paddingVertical = 12;
        baseStyle.paddingHorizontal = 16;
        baseStyle.minHeight = 48;
        break;
    }

    switch (variant) {
      case "secondary":
        baseStyle.backgroundColor = "#E5E7EB";
        break;
      case "outline":
        baseStyle.backgroundColor = COLORS.card;
        baseStyle.borderWidth = 1.5;
        baseStyle.borderColor = COLORS.primary;
        break;
      case "danger":
        baseStyle.backgroundColor = COLORS.danger;
        break;
      case "ghost":
        baseStyle.backgroundColor = "transparent";
        break;
      case "primary":
      default:
        baseStyle.backgroundColor = COLORS.primary;
        break;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseText: TextStyle = {
      fontWeight: "600",
      textAlign: "center",
    };

    switch (size) {
      case "sm":
        baseText.fontSize = FONT_SIZE.sm;
        break;
      case "lg":
        baseText.fontSize = FONT_SIZE.lg;
        break;
      case "md":
      default:
        baseText.fontSize = FONT_SIZE.md;
        break;
    }

    switch (variant) {
      case "secondary":
        baseText.color = COLORS.text;
        break;
      case "outline":
      case "ghost":
        baseText.color = COLORS.primary;
        break;
      case "danger":
      case "primary":
      default:
        baseText.color = COLORS.white;
        break;
    }

    return baseText;
  };

  const spinnerColor =
    variant === "outline" || variant === "ghost"
      ? COLORS.primary
      : variant === "secondary"
      ? COLORS.text
      : COLORS.white;

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }], width: fullWidth ? "100%" : undefined },
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[getContainerStyle(), style]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={spinnerColor} />
        ) : (
          <>
            {icon ? <Animated.View style={styles.iconContainer}>{icon}</Animated.View> : null}
            <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    marginRight: 8,
  },
});
