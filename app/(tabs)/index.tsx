import { View, Text, StyleSheet, Pressable } from "react-native";

export default function HomeScreen() {

  function handleLocationPress() {
    console.log("Getting location...");
  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        GPS Context Assistant
      </Text>

      <Text style={styles.subtitle}>
        Intelligent location-based memory system
      </Text>

      <Pressable
        style={styles.button}
        onPress={handleLocationPress}
      >
        <Text style={styles.buttonText}>
          Get Current Location
        </Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#121212",

    justifyContent: "center",
    alignItems: "center",

    padding: 20,
  },

  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",

    marginBottom: 10,
  },

  subtitle: {
    color: "#aaaaaa",
    fontSize: 16,

    textAlign: "center",
    marginBottom: 40,
  },

  button: {
    backgroundColor: "#3b82f6",

    paddingVertical: 16,
    paddingHorizontal: 28,

    borderRadius: 14,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

});