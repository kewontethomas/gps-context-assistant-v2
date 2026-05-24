import { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors, radius, spacing } from "@/constants/theme";

type CardProps = {
  children: ReactNode;
  variant?: "default" | "blue" | "yellow";
  style?: ViewStyle;
};

export function Card({ children, variant = "default", style }: CardProps) {
  return (
    <View style={[styles.card, styles[variant], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    padding: spacing.card,
    marginBottom: 14,
  },

  default: {
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  blue: {
    backgroundColor: colors.primarySoft,
  },

  yellow: {
    backgroundColor: colors.warningSoft,
  },
});