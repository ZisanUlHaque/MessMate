import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bazarSchema, BazarFormValues } from "@/lib/validators";
import { useMessStore } from "@/stores/messStore";
import { useAddBazar } from "@/hooks/useBazar";
import { useUIStore } from "@/stores/uiStore";
import { BazarItem } from "@/types/bazar.types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ReceiptCamera } from "@/components/bazar/ReceiptCamera";
import { COLORS, FONT_SIZE } from "@/lib/constants";
import { formatDateISO } from "@/lib/helpers";

const CATEGORIES = ["GROCERY", "GAS", "UTILITY", "OTHER"] as const;
const UNITS = ["kg", "pcs", "ltr", "dozen", "gm"] as const;

export default function AddBazarScreen() {
  const currentMess = useMessStore((state) => state.currentMess);
  const showSnackbar = useUIStore((state) => state.showSnackbar);
  const addBazarMutation = useAddBazar();

  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [items, setItems] = useState<BazarItem[]>([]);

  // Item form states
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemUnit, setItemUnit] = useState<string>("kg");
  const [itemUnitPrice, setItemUnitPrice] = useState("");

  const todayISO = formatDateISO(new Date());

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BazarFormValues>({
    resolver: zodResolver(bazarSchema),
    defaultValues: {
      date: todayISO,
      totalAmount: "",
      category: "GROCERY",
      description: "",
    },
  });

  const selectedCategory = watch("category");

  const handleAddItem = () => {
    if (!itemName.trim()) {
      showSnackbar("Please enter item name", "error");
      return;
    }
    const qty = parseFloat(itemQuantity) || 1;
    const price = parseFloat(itemUnitPrice) || 0;
    const totalPrice = qty * price;

    const newItem: BazarItem = {
      itemName: itemName.trim(),
      quantity: qty,
      unit: itemUnit,
      unitPrice: price,
      totalPrice,
    };

    const updated = [...items, newItem];
    setItems(updated);

    // Auto-calculate total amount
    const sumTotal = updated.reduce((acc, curr) => acc + curr.totalPrice, 0);
    if (sumTotal > 0) {
      setValue("totalAmount", sumTotal.toFixed(2));
    }

    // Reset item inputs
    setItemName("");
    setItemQuantity("");
    setItemUnitPrice("");
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    const sumTotal = updated.reduce((acc, curr) => acc + curr.totalPrice, 0);
    if (sumTotal > 0) {
      setValue("totalAmount", sumTotal.toFixed(2));
    }
  };

  const onSubmit = async (data: BazarFormValues) => {
    if (!currentMess) {
      showSnackbar("No mess selected", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("messId", currentMess.id);
      formData.append("date", data.date);
      formData.append("totalAmount", data.totalAmount);
      formData.append("category", data.category);
      if (data.description) {
        formData.append("description", data.description);
      }
      formData.append("items", JSON.stringify(items));

      if (receiptUri) {
        const filename = receiptUri.split("/").pop() || "receipt.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        formData.append("receipt", {
          uri: receiptUri,
          name: filename,
          type,
        } as any);
      }

      await addBazarMutation.mutateAsync(formData);
      showSnackbar("Expense added successfully!", "success");
      router.back();
    } catch (err: any) {
      showSnackbar(err?.message || "Failed to add expense", "error");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </Pressable>
            <Text style={styles.headerTitle}>Add Expense</Text>
            <View style={{ width: 24 }} />
          </View>

          <Card padding={16} style={styles.formCard}>
            {/* Category Selector */}
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.categoryChipsRow}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  style={[
                    styles.catChip,
                    selectedCategory === cat && styles.activeCatChip,
                  ]}
                  onPress={() => setValue("category", cat)}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      selectedCategory === cat && styles.activeCatChipText,
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Date Input */}
            <Controller
              control={control}
              name="date"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Date (YYYY-MM-DD)"
                  placeholder="2025-06-15"
                  value={value}
                  onChangeText={onChange}
                  icon="calendar-outline"
                  error={errors.date?.message}
                />
              )}
            />

            {/* Total Amount Input */}
            <Controller
              control={control}
              name="totalAmount"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Total Amount (৳)"
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                  icon="cash-outline"
                  error={errors.totalAmount?.message}
                />
              )}
            />

            {/* Description Input */}
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Description (Optional)"
                  placeholder="Weekly vegetable and fish bazar"
                  value={value || ""}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={2}
                  error={errors.description?.message}
                />
              )}
            />
          </Card>

          {/* Itemized List Section */}
          <Card padding={16} style={styles.itemsCard}>
            <Text style={styles.sectionTitle}>Itemized Details (Optional)</Text>
            <Text style={styles.itemsSub}>
              List individual items to auto-calculate the total
            </Text>

            <View style={styles.addItemForm}>
              <Input
                placeholder="Item name (e.g. Potato)"
                value={itemName}
                onChangeText={setItemName}
              />

              <View style={styles.itemInputsRow}>
                <View style={{ flex: 1 }}>
                  <Input
                    placeholder="Qty"
                    keyboardType="numeric"
                    value={itemQuantity}
                    onChangeText={setItemQuantity}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    placeholder="Unit Price"
                    keyboardType="numeric"
                    value={itemUnitPrice}
                    onChangeText={setItemUnitPrice}
                  />
                </View>
              </View>

              {/* Unit selection */}
              <View style={styles.unitChipsRow}>
                {UNITS.map((u) => (
                  <Pressable
                    key={u}
                    style={[
                      styles.unitChip,
                      itemUnit === u && styles.activeUnitChip,
                    ]}
                    onPress={() => setItemUnit(u)}
                  >
                    <Text
                      style={[
                        styles.unitChipText,
                        itemUnit === u && styles.activeUnitChipText,
                      ]}
                    >
                      {u}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Button
                title="+ Add Item"
                onPress={handleAddItem}
                variant="outline"
                size="sm"
                style={{ marginTop: 8 }}
              />
            </View>

            {/* Items List */}
            {items.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemRowName}>{item.itemName}</Text>
                  <Text style={styles.itemRowSub}>
                    {item.quantity} {item.unit} × ৳{item.unitPrice}
                  </Text>
                </View>
                <Text style={styles.itemRowTotal}>৳{item.totalPrice.toFixed(2)}</Text>
                <Pressable
                  onPress={() => handleRemoveItem(idx)}
                  style={styles.itemDeleteBtn}
                >
                  <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                </Pressable>
              </View>
            ))}
          </Card>

          {/* Receipt Photo Section */}
          <Card padding={16} style={styles.receiptCard}>
            <Text style={styles.sectionTitle}>Receipt Photo</Text>
            <ReceiptCamera
              existingUri={receiptUri}
              onCapture={(uri) => setReceiptUri(uri)}
            />
          </Card>

          {/* Save Button */}
          <Button
            title="Save Expense"
            onPress={handleSubmit(onSubmit)}
            loading={addBazarMutation.isPending}
            fullWidth
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.text,
  },
  formCard: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  categoryChipsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  catChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: COLORS.divider,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeCatChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catChipText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  activeCatChipText: {
    color: COLORS.white,
  },
  itemsCard: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    color: COLORS.text,
  },
  itemsSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  addItemForm: {
    backgroundColor: COLORS.divider,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  itemInputsRow: {
    flexDirection: "row",
    gap: 10,
  },
  unitChipsRow: {
    flexDirection: "row",
    gap: 6,
    marginVertical: 4,
  },
  unitChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeUnitChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  unitChipText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  activeUnitChipText: {
    color: COLORS.white,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  itemRowName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
    color: COLORS.text,
  },
  itemRowSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  itemRowTotal: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "700",
    color: COLORS.text,
    marginRight: 10,
  },
  itemDeleteBtn: {
    padding: 4,
  },
  receiptCard: {
    marginBottom: 20,
  },
  saveButton: {
    marginTop: 8,
  },
});
