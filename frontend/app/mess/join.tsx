import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useJoinMess } from "@/hooks/useMess";
import { useUIStore } from "@/stores/uiStore";
import { Button } from "@/components/ui/Button";
import { COLORS, FONT_SIZE, BORDER_RADIUS } from "@/lib/constants";

export default function JoinMessScreen() {
  const showSnackbar = useUIStore((state) => state.showSnackbar);
  const joinMessMutation = useJoinMess();

  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [requestSent, setRequestSent] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleTextChange = (text: string, index: number) => {
    const upper = text.toUpperCase();
    const newCode = [...code];

    if (upper.length > 1) {
      // Pasted full string or multiple characters
      const pastedChars = upper.slice(0, 6).split("");
      pastedChars.forEach((ch, idx) => {
        newCode[idx] = ch;
      });
      setCode(newCode);
      const nextIdx = Math.min(5, pastedChars.length);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    newCode[index] = upper;
    setCode(newCode);

    if (upper && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const fullCode = code.join("");
  const isComplete = fullCode.length === 6;

  const handleJoin = async () => {
    if (!isComplete) {
      showSnackbar("Please enter all 6 characters of the invite code", "error");
      return;
    }

    try {
      await joinMessMutation.mutateAsync({
        inviteCode: fullCode,
      });
      setRequestSent(true);
      showSnackbar("Join request sent successfully!", "success");
    } catch (err: any) {
      showSnackbar(err?.message || "Failed to join mess", "error");
    }
  };

  if (requestSent) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <Ionicons
            name="checkmark-circle-outline"
            size={72}
            color={COLORS.success}
          />
          <Text style={styles.successTitle}>Request Sent!</Text>
          <Text style={styles.successSub}>
            Your request to join the mess has been sent. Please wait for the mess
            manager to approve your membership.
          </Text>
          <Button
            title="Return to Dashboard"
            onPress={() => router.replace("/(tabs)/home")}
            fullWidth
            style={{ marginTop: 24 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </Pressable>
            <Text style={styles.headerTitle}>Join a Mess</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.centerContainer}>
            <Text style={styles.instructionTitle}>Enter 6-Digit Invite Code</Text>
            <Text style={styles.instructionSub}>
              Ask your mess manager for the unique 6-character mess code.
            </Text>

            {/* 6 Code Input Boxes */}
            <View style={styles.codeInputsRow}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={(text) => handleTextChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  maxLength={1}
                  autoCapitalize="characters"
                  style={[
                    styles.codeBox,
                    digit ? styles.codeBoxFilled : null,
                  ]}
                  textAlign="center"
                  selectTextOnFocus
                />
              ))}
            </View>

            <Button
              title="Submit Request"
              onPress={handleJoin}
              disabled={!isComplete}
              loading={joinMessMutation.isPending}
              fullWidth
              style={styles.submitButton}
            />
          </View>
        </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.text,
  },
  centerContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  instructionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    color: COLORS.text,
  },
  instructionSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 24,
  },
  codeInputsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 28,
    gap: 8,
  },
  codeBox: {
    width: 44,
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    backgroundColor: COLORS.background,
    fontFamily: "monospace",
  },
  codeBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.card,
  },
  submitButton: {
    width: "100%",
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  successSub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
});
