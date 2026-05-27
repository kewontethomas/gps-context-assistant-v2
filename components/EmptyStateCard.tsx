import { Text } from "react-native";

import { Card } from "@/components/Card";
import { colors, typography } from "@/constants/theme";

type EmptyStateCardProps = {
  title: string;
  message: string;
};

export function EmptyStateCard({ title, message }: EmptyStateCardProps) {
  return (
    <Card variant="yellow">
      <Text
        style={{
          color: "#4A3B14",
          fontSize: typography.cardTitle.fontSize,
          fontWeight: typography.cardTitle.fontWeight,
          marginBottom: 6,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: "#6B5E3D",
          fontSize: typography.body.fontSize,
          lineHeight: typography.body.lineHeight,
        }}
      >
        {message}
      </Text>
    </Card>
  );
}