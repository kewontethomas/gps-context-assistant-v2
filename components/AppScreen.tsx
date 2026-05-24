import { ReactNode } from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { colors, spacing } from "@/constants/theme";

type AppScreenProps = {
  children: ReactNode;
};

export function AppScreen({ children }: AppScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  screen: {
    padding: spacing.screen,
    paddingBottom: 120,
  },
});