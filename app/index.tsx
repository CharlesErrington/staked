import {
  StyleSheet,
  TextInput,
  FlatList,
  View,
  Text,
  LayoutAnimation,
} from "react-native";
import { theme } from "../theme";
import { ShoppingListItem } from "../components/ShoppingListItem";
import { useState, useEffect } from "react";
import { getFromStorage, saveToStorage } from "../utils/storage";
import * as Haptics from "expo-haptics";

const STORAGE_KEY = "shopping-list";

type ShoppingListItemType = {
  id: string;
  name: string;
  completedAtTimestamp?: number;
  lastUpdatedTimestamp?: number;
};

export default function App() {
  const [shappingList, setShappingList] = useState<ShoppingListItemType[]>([]);
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    const fetchInitial = async () => {
      const data = await getFromStorage(STORAGE_KEY);
      if (data) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShappingList(data);
      }
    };
    fetchInitial();
  }, []);

  const handleSubmit = () => {
    if (value.trim() === "") return;
    const newShoppingList = [
      {
        id: new Date().toISOString(),
        name: value,
        lastUpdatedTimestamp: Date.now(),
      },
      ...shappingList,
    ];
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShappingList(newShoppingList);
    saveToStorage(STORAGE_KEY, newShoppingList);
    setValue("");
  };

  const handleDelete = (id: string) => {
    const newShoppingList = shappingList.filter((item) => item.id !== id);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShappingList(newShoppingList);
  };

  const handleToggleComplete = (id: string) => {
    const newShoppingList = shappingList.map((item) => {
      if (item.id === id) {
        if (item.completedAtTimestamp) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        return {
          ...item,
          completedAtTimestamp: item.completedAtTimestamp
            ? undefined
            : Date.now(),
          lastUpdatedTimestamp: Date.now(),
        };
      } else {
        return item;
      }
    });
    saveToStorage(STORAGE_KEY, newShoppingList);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShappingList(newShoppingList);
  };

  return (
    <FlatList
      ListHeaderComponent={
        <TextInput
          value={value}
          style={styles.textInput}
          onChangeText={setValue}
          placeholder="E.g. Coffee"
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
        />
      }
      ListEmptyComponent={
        <View style={styles.listEmptyContainer}>
          <Text>Your shopping list is empty</Text>
        </View>
      }
      data={orderShoppingList(shappingList)}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      stickyHeaderIndices={[0]}
      renderItem={({ item }) => (
        <ShoppingListItem
          name={item.name}
          onDelete={() => handleDelete(item.id)}
          onToggleCompleted={() => handleToggleComplete(item.id)}
          isCompleted={!!item.completedAtTimestamp}
        />
      )}
    ></FlatList>
  );
}

function orderShoppingList(shoppingList: ShoppingListItemType[]) {
  return shoppingList.sort((item1, item2) => {
    if (item1.completedAtTimestamp && item2.completedAtTimestamp) {
      return item2.completedAtTimestamp - item1.completedAtTimestamp;
    }

    if (item1.completedAtTimestamp && !item2.completedAtTimestamp) {
      return 1;
    }

    if (!item1.completedAtTimestamp && item2.completedAtTimestamp) {
      return -1;
    }

    if (!item1.completedAtTimestamp && !item2.completedAtTimestamp) {
      return item2.lastUpdatedTimestamp - item1.lastUpdatedTimestamp;
    }

    return 0;
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colorWhite,

    paddingTop: 12,
  },
  textInput: {
    borderColor: theme.colorLightGrey,
    borderWidth: 2,
    padding: 12,
    fontSize: 18,
    borderRadius: 50,
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: theme.colorWhite,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  listEmptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 18,
  },
});
