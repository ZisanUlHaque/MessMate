import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMessStore } from "@/stores/messStore";
import { useBazars, useBazarSummary } from "@/hooks/useBazar";
import { BazarCard } from "@/components/bazar/BazarCard";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { COLORS, FONT_SIZE } from "@/lib/constants";
import { formatCurrency, getMonthName } from "@/lib/helpers";

const CATEGORIES = ["ALL", "GROCERY", "GAS", "UTILITY", "OTHER"] as const;

export default function BazarScreen() {
  const currentMess = useMessStore((state) => state.currentMess);

  const [date, setDate] = useState(() => new Date());
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const [selectedCategory, setSelectedCategory] =
    useState<(typeof CATEGORIES)[number]>("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const messId = currentMess?.id || "";

  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useBazarSummary(messId, month, year);

  const {
    data: bazarsData,
    isLoading: isBazarsLoading,
    refetch: refetchBazars,
  } = useBazars(
    messId,
    month,
    year,
    selectedCategory === "ALL" ? undefined : selectedCategory
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchSummary(), refetchBazars()]);
    setRefreshing(false);
  }, [refetchSummary, refetchBazars]);

  const handlePrevMonth = () => {
    setDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const bazars = useMemo(() => bazarsData?.bazars || [], [bazarsData]);
  const grandTotal = summaryData?.grandTotal || 0;
  const categoriesSummary = summaryData?.categories || [];

  if (!currentMess) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <EmptyState
          icon="cart-outline"
          title="No Mess Selected"
          subtitle="Join or create a mess to view and log bazar expenses."
        />
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View style={styles.headerContainer}>
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

      {/* Summary Card */}
      <Card style={styles.summaryCard} padding={16}>
        <Text style={styles.summaryTitle}>Total Expense</Text>
        <Text style={styles.grandTotalText}>{formatCurrency(grandTotal)}</Text>

        <View style={styles.categoriesBreakdownRow}>
          {categoriesSummary.map((item) => (
            <View key={item.category} style={styles.catSummaryItem}>
              <Text style={styles.catSummaryLabel}>{item.category}</Text>
              <Text style={styles.catSummaryValue}>
                {formatCurrency(item.total)}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Category Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollView}
      >
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            style={[
              styles.filterChip,
              selectedCategory === cat && styles.activeFilterChip,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === cat && styles.activeFilterChipText,
              ]}
            >
              {cat === "ALL" ? "All" : cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {isSummaryLoading && isBazarsLoading ? (
        <LoadingSpinner fullScreen message="Loading expenses..." />
      ) : (
        <FlatList
          data={bazars}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BazarCard
              bazar={item}
              onPress={() => router.push(`/bazar/${item.id}`)}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <EmptyState
              icon="receipt-outline"
              title="No Expenses Found"
              subtitle={`No ${selectedCategory === "ALL" ? "" : selectedCategory} expenses found for this month.`}
              actionLabel="Add Expense"
              onAction={() => router.push("/bazar/add")}
            />
          }
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
        />
      )}

      {/* Floating Action Button */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push("/bazar/add")}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  headerContainer: {
    paddingTop: 8,
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
  summaryCard: {
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  grandTotalText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: "800",
    color: COLORS.text,
    marginVertical: 4,
  },
  categoriesBreakdownRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  catSummaryItem: {
    minWidth: 70,
  },
  catSummaryLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
  },
  catSummaryValue: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 2,
  },
  filterScrollView: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 12,
  },
  filterChip: {
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
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
});
