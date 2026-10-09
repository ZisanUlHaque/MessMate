import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Meal } from "@/types/meal.types";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { COLORS, FONT_SIZE } from "@/lib/constants";
import { formatDateShort } from "@/lib/helpers";

export interface MealCardProps {
  meal: Meal;
  showUser?: boolean;
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  showUser = true,
}) => {
  const userName = meal.user?.fullName || "Member";

  return (
    <Card style={styles.cardContainer} padding={12}>
      <View style={styles.contentRow}>
        {showUser ? (
          <View style={styles.userInfo}>
            <Avatar name={userName} size={36} />
            <View style={styles.nameContainer}>
              <Text style={styles.userName} numberOfLines={1}>
                {userName}
              </Text>
              {meal.isLocked ? (
                <View style={styles.lockedBadge}>
                  <Ionicons name="lock-closed" size={12} color={COLORS.danger} />
                  <Text style={styles.lockedText}>Locked</Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : (
          <View style={styles.dateInfo}>
            <Text style={styles.dateText}>{formatDateShort(meal.date)}</Text>
          </View>
        )}

        <View style={styles.indicators}>
          <View style={styles.indicatorItem}>
            <Text style={styles.indicatorLabel}>B</Text>
            {meal.breakfast ? (
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            ) : (
              <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
            )}
          </View>

          <View style={styles.indicatorItem}>
            <Text style={styles.indicatorLabel}>L</Text>
            {meal.lunch ? (
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            ) : (
              <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
            )}
          </View>

          <View style={styles.indicatorItem}>
            <Text style={styles.indicatorLabel}>D</Text>
            {meal.dinner ? (
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            ) : (
              <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
            )}
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 4,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  nameContainer: {
    marginLeft: 10,
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
    color: COLORS.text,
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  lockedText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.danger,
    marginLeft: 3,
  },
  dateInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
    color: COLORS.text,
  },
  indicators: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  indicatorItem: {
    alignItems: "center",
  },
  indicatorLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
});
