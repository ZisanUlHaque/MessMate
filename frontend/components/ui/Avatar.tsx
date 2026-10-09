import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { getInitials } from "@/lib/helpers";
import { COLORS } from "@/lib/constants";

export interface AvatarProps {
  name: string;
  size?: number;
  imageUrl?: string | null;
}

const AVATAR_COLORS = [
  "#1A73E8",
  "#34A853",
  "#FBBC04",
  "#EA4335",
  "#9333EA",
  "#0D9488",
  "#E11D48",
  "#2563EB",
  "#D97706",
  "#059669",
];

function getColorForName(name: string): string {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 40,
  imageUrl,
}) => {
  const initials = getInitials(name);
  const bgColor = getColorForName(name);

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatarContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
        },
      ]}
    >
      <Text
        style={[
          styles.initialsText,
          {
            fontSize: Math.round(size * 0.4),
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  initialsText: {
    color: COLORS.white,
    fontWeight: "700",
  },
  image: {
    backgroundColor: COLORS.border,
  },
});
