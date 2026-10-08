export const COLORS = {
  primary: '#1A73E8',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  background: '#F3F4F6',
  card: '#FFFFFF',
  text: '#111827',
  textLight: '#6B7280',
  border: '#E5E7EB',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 16,
  full: 9999,
} as const;
