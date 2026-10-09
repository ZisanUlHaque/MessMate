import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { Meal } from "@/types/meal.types";
import { COLORS } from "@/lib/constants";
import { formatDateISO } from "@/lib/helpers";

export interface MealCalendarProps {
  meals: Meal[];
  selectedDate: string; // "YYYY-MM-DD"
  onDayPress: (date: string) => void;
  currentMonth?: string; // "YYYY-MM-01"
  onMonthChange?: (month: DateData) => void;
}

export const MealCalendar: React.FC<MealCalendarProps> = ({
  meals,
  selectedDate,
  onDayPress,
  currentMonth,
  onMonthChange,
}) => {
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    const todayStr = formatDateISO(new Date());

    const dateMealsMap: Record<string, number> = {};
    meals.forEach((meal) => {
      // Date may be ISO datetime string, normalize to YYYY-MM-DD
      const dateKey = meal.date.includes("T")
        ? meal.date.split("T")[0]
        : meal.date;
      const count =
        (meal.breakfast ? 1 : 0) +
        (meal.lunch ? 1 : 0) +
        (meal.dinner ? 1 : 0);
      dateMealsMap[dateKey] = (dateMealsMap[dateKey] || 0) + count;
    });

    Object.keys(dateMealsMap).forEach((dateKey) => {
      const count = dateMealsMap[dateKey];
      let dotColor = COLORS.danger;
      if (count >= 3) {
        dotColor = COLORS.success;
      } else if (count >= 1) {
        dotColor = COLORS.warning;
      }

      marks[dateKey] = {
        marked: true,
        dotColor,
      };
    });

    if (marks[selectedDate]) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: COLORS.primary,
        selectedTextColor: COLORS.white,
      };
    } else {
      marks[selectedDate] = {
        selected: true,
        selectedColor: COLORS.primary,
        selectedTextColor: COLORS.white,
      };
    }

    if (marks[todayStr]) {
      marks[todayStr] = {
        ...marks[todayStr],
        today: true,
      };
    }

    return marks;
  }, [meals, selectedDate]);

  return (
    <View style={styles.container}>
      <Calendar
        current={currentMonth || selectedDate}
        onDayPress={(day: DateData) => onDayPress(day.dateString)}
        onMonthChange={onMonthChange}
        markedDates={markedDates}
        theme={{
          backgroundColor: COLORS.card,
          calendarBackground: COLORS.card,
          textSectionTitleColor: COLORS.textSecondary,
          selectedDayBackgroundColor: COLORS.primary,
          selectedDayTextColor: COLORS.white,
          todayTextColor: COLORS.primary,
          dayTextColor: COLORS.text,
          textDisabledColor: COLORS.border,
          dotColor: COLORS.primary,
          selectedDotColor: COLORS.white,
          arrowColor: COLORS.primary,
          monthTextColor: COLORS.text,
          indicatorColor: COLORS.primary,
          textDayFontWeight: "500",
          textMonthFontWeight: "700",
          textDayHeaderFontWeight: "600",
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.card,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 16,
  },
});
