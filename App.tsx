import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import { theme } from "./theme";

export default function App() {
  const handleDelete = () => {
    Alert.alert(
      "Are you sure you want to delete this item?",
      "It will be gone for good",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => console.log("deleted"),
        },
      ]
    );
  };
  return (
    <View style={styles.container}>
      <View style={styles.itemContainer}>
        <Text style={styles.itemText}>
          Open up App.tsx to start working on your app test!
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleDelete}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  itemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#1a759f",
    paddingHorizontal: 8,
    paddingVertical: 16,
    flexDirection: "row",
    gap: 20,
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
  },
  itemText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: theme.colorCerulean,
    padding: 10,
    borderRadius: 6,
  },
  buttonText: {
    color: theme.colorWhite,
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
