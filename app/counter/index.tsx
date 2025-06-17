import { Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { theme } from "../../theme";
import { registerForPushNotificationsAsync } from "../../utils/registerForPushNotificationsAsync";
import * as Notifications from "expo-notifications";
import { useState, useEffect } from "react";
import { intervalToDuration, isBefore } from "date-fns";
import { TimerSegment } from "../../components/TimerSegment";

const TIMESTAMP = Date.now() + 10 * 1000;

type CountdownStatus = {
  isOverdue: boolean;
  distance: ReturnType<typeof intervalToDuration>;
};

export default function CounterScreen() {
  const [status, setStatus] = useState<CountdownStatus>({
    isOverdue: false,
    distance: {},
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      const isOverdue = isBefore(TIMESTAMP, Date.now());

      const distance = intervalToDuration(
        isOverdue
          ? { end: Date.now(), start: TIMESTAMP }
          : { start: Date.now(), end: TIMESTAMP }
      );

      setStatus({
        isOverdue,
        distance,
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const scheduleNotification = async () => {
    const result = await registerForPushNotificationsAsync();
    if (result === "granted") {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "I'm a notification from your app! 📨",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 5,
        },
      });
    } else {
      Alert.alert(
        "Unable to schedule notification",
        "Please enable notifications in your device settings"
      );
    }
  };

  return (
    <View
      style={[
        styles.container,
        status.isOverdue ? styles.containerLate : undefined,
      ]}
    >
      {status.isOverdue ? (
        <Text style={[styles.heading]}>Thing due in</Text>
      ) : (
        <Text style={[styles.heading, styles.whiteText]}>Thing overdue by</Text>
      )}
      <View style={styles.row}>
        <TimerSegment
          number={status.distance?.days ?? 0}
          unit="Days"
          textStyle={status.isOverdue ? styles.whiteText : undefined}
        />
        <TimerSegment
          number={status.distance?.hours ?? 0}
          unit="Hours"
          textStyle={status.isOverdue ? styles.whiteText : undefined}
        />
        <TimerSegment
          number={status.distance?.minutes ?? 0}
          unit="Minutes"
          textStyle={status.isOverdue ? styles.whiteText : undefined}
        />
        <TimerSegment
          number={status.distance?.seconds ?? 0}
          unit="Seconds"
          textStyle={status.isOverdue ? styles.whiteText : undefined}
        />
      </View>
      <TouchableOpacity
        onPress={scheduleNotification}
        style={styles.button}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>I've done the thing!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colorWhite,
  },
  text: {
    fontSize: 24,
  },
  button: {
    backgroundColor: theme.colorBlack,
    padding: 12,
    borderRadius: 6,
  },
  row: {
    flexDirection: "row",
    marginBottom: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: theme.colorBlack,
  },
  containerLate: {
    backgroundColor: theme.colorRed,
  },
  whiteText: {
    color: theme.colorWhite,
  },
  buttonText: {
    color: theme.colorWhite,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
