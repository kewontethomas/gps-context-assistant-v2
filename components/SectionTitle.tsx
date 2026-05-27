import { Text } from "react-native";

import { colors, typography } from "@/constants/theme";

type SectionTitleProps = {
  children: string;
};

export function SectionTitle({ children }: SectionTitleProps) {
  return (
    <Text
      style={{
        ...typography.sectionTitle,
        color: colors.text,
        marginBottom: 12,
      }}
    >
      {children}
    </Text>
  );
}