import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BarChart } from "react-native-chart-kit";
import { useAuth } from "@/hooks/useAuth";
import { useMessStore } from "@/stores/messStore";
import {
  useMealCalendar,
  useMealStats,
  useMyMeals,
} from "@/hooks/useMeals";
import { MealCalendar } from "@/components/meal/MealCalendar";
import { MealCard } from "@/components/meal/MealCard";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { COLORS, FONT_SIZE } from "@/lib/constants";
import {
  formatDate,
  formatDateISO,
  getMonthName,
} from "@/lib/helpers";

const screenWidth = Dimensions.get("window").width;

export default function MealsScreen() {
  const { user } = useAuth();
  const currentMess = useMessStore((state) => state.currentMess);

  const [date, setDate] = useState(() => new Date());
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const [selectedDate, setSelectedDate] = useState(() =>
    formatDateISO(new Date())
  );
  const [filterMode, setFilterMode] = useState<"ALL" | "MY">("ALL");
  const [showStats, setShowStats] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const messId = currentMess?.id || "";

  const {
    data: calendarMeals = [],
    isLoading: isCalendarLoading,
    refetch: refetchCalendar,
  } = useMealCalendar(messId, month, year);

  const {
    data: myMeals = [],
    isLoading: isMyMealsLoading,
    refetch: refetchMyMeals,
  } = useMyMeals(messId, month, year);

  const {
    data: mealStats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useMealStats(messId, month, year);

  const isManager = user?.role === "MANAGER";

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchCalendar(), refetchMyMeals(), refetchStats()]);
    setRefreshing(false);
  }, [refetchCalendar, refetchMyMeals, refetchStats]);

  const handlePrevMonth = () => {
    setDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Filter meals for the selected date
  const selectedDayMeals = useMemo(() => {
    const source = filterMode === "ALL" ? calendarMeals : myMeals;
    return source.filter((m) => {
      const mealDateStr = m.date.includes("T") ? m.date.split("T")[0] : m.date;
      return mealDateStr === selectedDate;
    });
  }, [calendarMeals, myMeals, selectedDate, filterMode]);

  // Chart data formatting
  const chartData = useMemo(() => {
    if (!mealStats || !mealStats.memberStats || mealStats.memberStats.length === 0) {
      return null;
    }
    const labels = mealStats.memberStats.slice(0, 5).map((m) => {
      const parts = m.fullName.trim().split(" ");
      return parts[0] || m.fullName;
    });
    const dataset = mealStats.memberStats.slice(0, 5).map((m) => m.totalMeals);
    return {
      labels,
      datasets: [{ data: dataset }],
    };
  }, [mealStats]);

  if (!currentMess) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <EmptyState
          icon="restaurant-outline"
          title="No Mess Selected"
          subtitle="Join or create a mess from Home to view and track meal entries."
        />
      </SafeAreaView>
    );
  }

  const isLoading = isCalendarLoading && isMyMealsLoading;

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
        {/* Month Navigation */}
        <View style={styles.monthHeaderRow}>
          <Pressable onPress={handlePrevMonth} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
          </Pressable>
          <Text style={styles.monthHeaderText}>
            {getMonthName(month)} {year}
          </Text>
          <Pressable onPress={handleNextMonth} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
          </Pressable>
        </View>

        {/* Calendar */}
        {isLoading ? (
          <LoadingSpinner message="Loading meals..." />
        ) : (
          <MealCalendar
            meals={filterMode === "ALL" ? calendarMeals : myMeals}
            selectedDate={selectedDate}
            onDayPress={(dayStr) => setSelectedDate(dayStr)}
          />
        )}

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          <Pressable
            style={[
              styles.filterChip,
              filterMode === "ALL" && styles.activeFilterChip,
            ]}
            onPress={() => setFilterMode("ALL")}
          >
            <Text
              style={[
                styles.filterChipText,
                filterMode === "ALL" && styles.activeFilterChipText,
              ]}
            >
              All Members
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterChip,
              filterMode === "MY" && styles.activeFilterChip,
            ]}
            onPress={() => setFilterMode("MY")}
          >
            <Text
              style={[
                styles.filterChipText,
                filterMode === "MY" && styles.activeFilterChipText,
              ]}
            >
              My Meals
            </Text>
          </Pressable>

          {isManager ? (
            <Pressable
              style={[
                styles.filterChip,
                showStats && styles.activeFilterChip,
                { marginLeft: "auto" },
              ]}
              onPress={() => setShowStats(!showStats)}
            >
              <Ionicons
                name="bar-chart-outline"
                size={16}
                color={showStats ? COLORS.white : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.filterChipText,
                  showStats && styles.activeFilterChipText,
                  { marginLeft: 4 },
                ]}
              >
                Stats
              </Text>
            </Pressable>
          ) : null}
        </View>

        {/* Manager Stats Section */}
        {isManager && showStats && mealStats ? (
          <Card style={styles.statsCard} padding={16}>
            <Text style={styles.statsTitle}>Monthly Meal Analytics</Text>
            <View style={styles.statsSummaryRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Meals</Text>
                <Text style={styles.statValue}>{mealStats.totalMeals}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Daily Average</Text>
                <Text style={styles.statValue}>
                  {mealStats.dailyAverage.toFixed(1)}
                </Text>
              </View>
            </View>

            {chartData && (
              <View style={styles.chartContainer}>
                <BarChart
                  data={chartData}
                  width={screenWidth - 64}
                  height={180}
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={{
                    backgroundColor: COLORS.card,
                    backgroundGradientFrom: COLORS.card,
                    backgroundGradientTo: COLORS.card,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(26, 115, 232, ${opacity})`,
                    labelColor: (opacity = 1) =>
                      `rgba(107, 114, 128, ${opacity})`,
                    style: {
                      borderRadius: 12,
                    },
                  }}
                  style={styles.chart}
                />
              </View>
            )}
          </Card>
        ) : null}

        {/* Selected Day Meals List */}
        <View style={styles.dayDetailsSection}>
          <Text style={styles.dayDetailsTitle}>
            Meals on {formatDate(selectedDate)}
          </Text>

          {selectedDayMeals.length === 0 ? (
            <Card padding={20}>
              <Text style={styles.noDayMealsText}>
                No meal entries found for this date.
              </Text>
            </Card>
          ) : (
            selectedDayMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                showUser={filterMode === "ALL"}
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
  monthHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  navButton: {
    padding: 6,
  },
  monthHeaderText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.text,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  activeFilterChipText: {
    color: COLORS.white,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 10,
  },
  statsSummaryRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.divider,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 2,
  },
  chartContainer: {
    alignItems: "center",
    marginTop: 6,
  },
  chart: {
    borderRadius: 8,
  },
  dayDetailsSection: {
    marginTop: 4,
  },
  dayDetailsTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  noDayMealsText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
