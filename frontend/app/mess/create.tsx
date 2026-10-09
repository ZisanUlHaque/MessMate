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
import { Portal, Modal } from "react-native-paper";
import { messSchema, MessFormValues } from "@/lib/validators";
import { useCreateMess } from "@/hooks/useMess";
import { useUIStore } from "@/stores/uiStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { InviteCodeBox } from "@/components/mess/InviteCodeBox";
import { COLORS, FONT_SIZE } from "@/lib/constants";

export default function CreateMessScreen() {
  const showSnackbar = useUIStore((state) => state.showSnackbar);
  const createMessMutation = useCreateMess();

  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MessFormValues>({
    resolver: zodResolver(messSchema),
    defaultValues: {
      name: "",
      address: "",
    },
  });

  const onSubmit = async (data: MessFormValues) => {
    try {
      const newMess = await createMessMutation.mutateAsync({
        name: data.name,
        address: data.address,
      });
      setCreatedCode(newMess.inviteCode);
      showSnackbar("Mess created successfully!", "success");
    } catch (err: any) {
      showSnackbar(err?.message || "Failed to create mess", "error");
    }
  };

  const handleDone = () => {
    setCreatedCode(null);
    router.replace("/(tabs)/home");
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
            <Text style={styles.headerTitle}>Create New Mess</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formSubtitle}>
              Give your mess a name and optional address. You'll become the manager.
            </Text>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Mess Name"
                  placeholder="e.g. Uttara Bachelors Flat 4B"
                  value={value}
                  onChangeText={onChange}
                  icon="home-outline"
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Address (Optional)"
                  placeholder="House #12, Road #4, Sector 7, Uttara"
                  value={value || ""}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={3}
                  icon="location-outline"
                  error={errors.address?.message}
                />
              )}
            />

            <Button
              title="Create Mess"
              onPress={handleSubmit(onSubmit)}
              loading={createMessMutation.isPending}
              fullWidth
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal showing Invite Code */}
      <Portal>
        <Modal
          visible={!!createdCode}
          onDismiss={handleDone}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>🎉 Mess Created!</Text>
          <Text style={styles.modalSubtitle}>
            Share this invite code with your messmates so they can join:
          </Text>

          {createdCode && <InviteCodeBox code={createdCode} />}

          <Button
            title="Go to Dashboard"
            onPress={handleDone}
            fullWidth
            style={{ marginTop: 12 }}
          />
        </Modal>
      </Portal>
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
    padding: 20,
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.text,
  },
  formContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  formSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  submitButton: {
    marginTop: 8,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    padding: 24,
    margin: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 16,
  },
});
