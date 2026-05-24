import { Pressable, Text, StyleSheet } from "react-native";
import { colors, radius } from "@/constants/theme";

type PrimaryButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary";
};

export function PrimaryButton({
  title,
  onPress,
  variant = "primary",
}: PrimaryButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      style={[
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.buttonText,
          isPrimary ? styles.primaryText : styles.secondaryText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.button,
    paddingVertical: 16,
    alignItems: "center",
  },

  primaryButton: {
    backgroundColor: colors.primary,
  },

  secondaryButton: {
    backgroundColor: colors.primarySoft,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "800",
  },

  primaryText: {
    color: "#FFFFFF",
  },

  secondaryText: {
    color: colors.primary,
  },
});