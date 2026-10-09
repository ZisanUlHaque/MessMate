export const COLORS = {
  primary: "#1A73E8",
  primaryDark: "#0D47A1",
  primaryLight: "#E8F0FE",
  success: "#34A853",
  successLight: "#E6F4EA",
  warning: "#FBBC04",
  warningLight: "#FEF7E0",
  danger: "#EA4335",
  dangerLight: "#FCE8E6",
  background: "#F5F5F5",
  card: "#FFFFFF",
  text: "#1F2937",
  textSecondary: "#6B7280",
  textLight: "#9CA3AF",
  border: "#E5E7EB",
  divider: "#F3F4F6",
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(0,0,0,0.5)",
};

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://messmatebackend-seven.vercel.app/api/v1";

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const SHADOW = {
  elevation: 2,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
};
