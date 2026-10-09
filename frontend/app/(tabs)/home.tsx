import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useMessStore } from "@/stores/messStore";
import { useTodayMeals, useMarkMeal } from "@/hooks/useMeals";
import { useBazarSummary, useBazars } from "@/hooks/useBazar";
import { useMyBill } from "@/hooks/useBills";
import { useUIStore } from "@/stores/uiStore";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MealToggle } from "@/components/meal/MealToggle";
import { BazarCard } from "@/components/bazar/BazarCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { COLORS, FONT_SIZE } from "@/lib/constants";
import {
  formatCurrency,
  formatDate,
  formatDateISO,
  getGreeting,
  getMonthName,
} from "@/lib/helpers";

export default function HomeScreen() {
  const { user } = useAuth();
  const showSnackbar = useUIStore((state) => state.showSnackbar);

  const currentMess = useMessStore((state) => state.currentMess);
  const messes = useMessStore((state) => state.messes);
  const fetchMesses = useMessStore((state) => state.fetchMesses);
  const setCurrentMess = useMessStore((state) => state.setCurrentMess);
  const isMessLoading = useMessStore((state) => state.isLoading);

  const [refreshing, setRefreshing] = useState(false);

  const currentDate = useMemo(() => new Date(), []);
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const todayISO = useMemo(() => formatDateISO(currentDate), [currentDate]);

  useEffect(() => {
    fetchMesses();
  }, [fetchMesses]);

  const messId = currentMess?.id || "";

  // Queries
  const {
    data: todayMeals,
    isLoading: isMealsLoading,
    error: mealsError,
    refetch: refetchMeals,
  } = useTodayMeals(messId);

  const {
    data: bazarSummary,
    isLoading: isBazarSummaryLoading,
    refetch: refetchBazarSummary,
  } = useBazarSummary(messId, currentMonth, currentYear);

  const {
    data: recentBazarsData,
    isLoading: isBazarsLoading,
    refetch: refetchBazars,
  } = useBazars(messId, currentMonth, currentYear, undefined, 1, 3);

  const {
    data: myBill,
    isLoading: isBillLoading,
    refetch: refetchBill,
  } = useMyBill(messId, currentMonth, currentYear);

  const markMealMutation = useMarkMeal();

  // Find user's today meal
  const myTodayMeal = useMemo(() => {
    if (!todayMeals || !user) return null;
    return todayMeals.find((m) => m.userId === user.id) || null;
  }, [todayMeals, user]);

  // Local optimistic meal states
  const [localMeals, setLocalMeals] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
  });

  useEffect(() => {
    if (myTodayMeal) {
      setLocalMeals({
        breakfast: !!myTodayMeal.breakfast,
        lunch: !!myTodayMeal.lunch,
        dinner: !!myTodayMeal.dinner,
      });
    } else {
      setLocalMeals({
        breakfast: false,
        lunch: false,
        dinner: false,
      });
    }
  }, [myTodayMeal]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchMesses(),
      refetchMeals(),
      refetchBazarSummary(),
      refetchBazars(),
      refetchBill(),
    ]);
    setRefreshing(false);
  }, [
    fetchMesses,
    refetchMeals,
    refetchBazarSummary,
    refetchBazars,
    refetchBill,
  ]);

  const handleToggleMeal = useCallback(
    async (mealType: "breakfast" | "lunch" | "dinner") => {
      if (!currentMess) {
        showSnackbar("Please join or create a mess first", "info");
        return;
      }

      if (myTodayMeal?.isLocked) {
        showSnackbar("Meal marking deadline has passed for today", "error");
        return;
      }

      const prevValue = localMeals[mealType];
      const updatedMeals = {
        ...localMeals,
        [mealType]: !prevValue,
      };

      // Optimistic update
      setLocalMeals(updatedMeals);

      try {
        await markMealMutation.mutateAsync({
          messId: currentMess.id,
          date: todayISO,
          breakfast: updatedMeals.breakfast,
          lunch: updatedMeals.lunch,
          dinner: updatedMeals.dinner,
        });
        showSnackbar(`${mealType} updated!`, "success");
      } catch (err: any) {
        // Rollback
        setLocalMeals(localMeals);
        showSnackbar(err?.message || "Failed to update meal", "error");
      }
    },
    [
      currentMess,
      myTodayMeal,
      localMeals,
      todayISO,
      markMealMutation,
      showSnackbar,
    ]
  );

  const isInitialLoading =
    isMessLoading &&
    isMealsLoading &&
    isBazarSummaryLoading &&
    isBazarsLoading &&
    isBillLoading;

  if (isInitialLoading) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  const recentExpenses = recentBazarsData?.bazars || [];
  const grandTotal = bazarSummary?.grandTotal || 0;
  const mealRate = myBill?.mealRate || 0;
  const myDue = myBill?.dueAmount || 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header Section */}
        <View style={styles.headerRow}>
          <View style={styles.userInfo}>
            <Avatar name={user?.fullName || "User"} size={44} />
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>{getGreeting()},</Text>
              <Text style={styles.userNameText} numberOfLines={1}>
                {user?.fullName || "MessMate"}
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.notificationButton}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={COLORS.text}
            />
          </Pressable>
        </View>

        {/* Mess Selector / No Mess Warning */}
        {messes.length === 0 ? (
          <Card style={styles.noMessCard} padding={16}>
            <Text style={styles.noMessTitle}>You are not in any mess yet</Text>
            <Text style={styles.noMessSub}>
              Create your own mess or join an existing mess with an invite code.
            </Text>
            <View style={styles.noMessButtons}>
              <Button
                title="Create Mess"
                onPress={() => router.push("/mess/create")}
                variant="primary"
                size="sm"
                style={{ flex: 1 }}
              />
              <Button
                title="Join Mess"
                onPress={() => router.push("/mess/join")}
                variant="outline"
                size="sm"
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        ) : (
          <View style={styles.messSelectorContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {messes.map((m) => (
                <Pressable
                  key={m.id}
                  onPress={() => setCurrentMess(m)}
                  style={[
                    styles.messChip,
                    currentMess?.id === m.id && styles.activeMessChip,
                  ]}
                >
                  <Text
                    style={[
                      styles.messChipText,
                      currentMess?.id === m.id && styles.activeMessChipText,
                    ]}
                  >
                    {m.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {mealsError ? (
          <ErrorBanner
            message="Could not fetch today's meals"
            onRetry={refetchMeals}
          />
        ) : null}

        {/* Today's Meals Section */}
        <Card style={styles.sectionCard} padding={16}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Today's Meals</Text>
            <Text style={styles.sectionSubtitle}>{formatDate(currentDate)}</Text>
          </View>

          {myTodayMeal?.isLocked ? (
            <View style={styles.lockedNotice}>
              <Ionicons name="time-outline" size={16} color={COLORS.danger} />
              <Text style={styles.lockedNoticeText}>
                Deadline passed. Meal changes are locked.
              </Text>
            </View>
          ) : null}

          <View style={styles.mealsRow}>
            <MealToggle
              mealType="breakfast"
              isActive={localMeals.breakfast}
              isLocked={myTodayMeal?.isLocked}
              onToggle={() => handleToggleMeal("breakfast")}
            />
            <MealToggle
              mealType="lunch"
              isActive={localMeals.lunch}
              isLocked={myTodayMeal?.isLocked}
              onToggle={() => handleToggleMeal("lunch")}
            />
            <MealToggle
              mealType="dinner"
              isActive={localMeals.dinner}
              isLocked={myTodayMeal?.isLocked}
              onToggle={() => handleToggleMeal("dinner")}
            />
          </View>
        </Card>

        {/* Month Summary Section */}
        <Card style={styles.sectionCard} padding={16}>
          <Text style={styles.sectionTitle}>
            {getMonthName(currentMonth)} {currentYear} Summary
          </Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Total Expense</Text>
              <Text style={styles.summaryValue}>{formatCurrency(grandTotal)}</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Meal Rate</Text>
              <Text style={styles.summaryValue}>{formatCurrency(mealRate)}</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>My Due</Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: myDue > 0 ? COLORS.danger : COLORS.success },
                ]}
              >
                {formatCurrency(myDue)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions Row */}
        <View style={styles.quickActionsRow}>
          <Pressable
            style={styles.quickActionButton}
            onPress={() => router.push("/bazar/add")}
          >
            <View
              style={[
                styles.quickActionIconCircle,
                { backgroundColor: COLORS.primaryLight },
              ]}
            >
              <Ionicons name="cart" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionLabel}>Add Bazar</Text>
          </Pressable>

          <Pressable
            style={styles.quickActionButton}
            onPress={() => router.push("/(tabs)/bills")}
          >
            <View
              style={[
                styles.quickActionIconCircle,
                { backgroundColor: COLORS.successLight },
              ]}
            >
              <Ionicons name="receipt" size={20} color={COLORS.success} />
            </View>
            <Text style={styles.quickActionLabel}>View Bill</Text>
          </Pressable>

          <Pressable
            style={styles.quickActionButton}
            onPress={() => {
              if (currentMess?.id) {
                router.push(`/mess/${currentMess.id}`);
              } else {
                router.push("/mess/create");
              }
            }}
          >
            <View
              style={[
                styles.quickActionIconCircle,
                { backgroundColor: COLORS.warningLight },
              ]}
            >
              <Ionicons name="people" size={20} color={COLORS.warning} />
            </View>
            <Text style={styles.quickActionLabel}>Mess Info</Text>
          </Pressable>
        </View>

        {/* Recent Bazar Section */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeaderRow}>
            <Text style={styles.recentTitle}>Recent Expenses</Text>
            <Pressable onPress={() => router.push("/(tabs)/bazar")}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>

          {recentExpenses.length === 0 ? (
            <Card padding={16}>
              <Text style={styles.noExpensesText}>No expenses recorded yet.</Text>
            </Card>
          ) : (
            recentExpenses.map((bazar) => (
              <BazarCard
                key={bazar.id}
                bazar={bazar}
                onPress={() => router.push(`/bazar/${bazar.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  greetingContainer: {
    marginLeft: 12,
    flex: 1,
  },
  greetingText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  userNameText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.text,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  noMessCard: {
    marginBottom: 16,
  },
  noMessTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    color: COLORS.text,
  },
  noMessSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 12,
  },
  noMessButtons: {
    flexDirection: "row",
    gap: 12,
  },
  messSelectorContainer: {
    marginBottom: 12,
  },
  messChip: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeMessChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  messChipText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
    color: COLORS.text,
  },
  activeMessChipText: {
    color: COLORS.white,
  },
  sectionCard: {
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  lockedNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.dangerLight,
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    gap: 6,
  },
  lockedNoticeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.danger,
    fontWeight: "500",
  },
  mealsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 4,
  },
  summaryGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  summaryCol: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    color: COLORS.text,
  },
  verticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.divider,
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
    color: COLORS.text,
  },
  recentSection: {
    marginTop: 10,
  },
  recentHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recentTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
    color: COLORS.primary,
  },
  noExpensesText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
