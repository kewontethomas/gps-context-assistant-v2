export const colors = {
  background: "#F7F3EA",
  surface: "#FFFFFF",

  primary: "#2563EB",
  primarySoft: "#EAF3FF",

  success: "#16A34A",
  successSoft: "#DCFCE7",

  warning: "#CA8A04",
  warningSoft: "#FFF7DE",

  danger: "#DC2626",
  dangerSoft: "#FEE2E2",

  text: "#172033",
  mutedText: "#657084",
  softText: "#64748B",

  border: "#E5E7EB",
};

export const spacing = {
  screen: 22,
  section: 24,
  card: 20,
  small: 8,
  medium: 14,
  large: 28,
};

export const radius = {
  card: 24,
  button: 18,
  pill: 999,
};

export const typography = {
  appLabel: {
    fontSize: 13,
    fontWeight: "900" as const,
    letterSpacing: 1.4,
  },

  headline: {
    fontSize: 34,
    fontWeight: "900" as const,
    lineHeight: 40,
  },

  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900" as const,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "900" as const,
  },

  body: {
    fontSize: 15,
    lineHeight: 22,
  },

  caption: {
    fontSize: 13,
    lineHeight: 19,
  },
};