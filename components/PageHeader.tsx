import { Text, StyleSheet, View } from "react-native";
import { colors, typography } from "@/constants/theme";

type PageHeaderProps = {
  label: string;
  title: string;
  subtitle: string;
};

export function PageHeader({ label, title, subtitle }: PageHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 18,
    marginBottom: 22,
  },

  label: {
    ...typography.appLabel,
    color: colors.primary,
    marginBottom: 18,
  },

  title: {
    ...typography.headline,
    color: colors.text,
    marginBottom: 12,
  },

  subtitle: {
    ...typography.subtitle,
    color: colors.mutedText,
  },
});