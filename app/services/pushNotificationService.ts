import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class PushNotificationService {
  private static instance: PushNotificationService;
  private notificationListener: any;
  private responseListener: any;

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return null;
    }

    try {
      // Get existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for notifications');
        return null;
      }

      // Get Expo push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      
      if (!projectId) {
        console.log('Project ID not found');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      // Configure Android channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6F00', // Headspace orange
        });
      }

      return tokenData.data;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  setupNotificationListeners(
    onNotification: (notification: Notifications.Notification) => void,
    onNotificationResponse: (response: Notifications.NotificationResponse) => void
  ) {
    // Handle notifications when app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(onNotification);

    // Handle notification responses (when user taps on notification)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(onNotificationResponse);
  }

  removeNotificationListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any,
    trigger?: Notifications.NotificationTriggerInput
  ) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        badge: 1,
      },
      trigger: trigger || null, // null means immediate
    });
  }

  async cancelAllScheduledNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }

  async clearBadge() {
    await Notifications.setBadgeCountAsync(0);
  }

  // Schedule daily habit reminder
  async scheduleDailyHabitReminder(hour: number, minute: number) {
    const trigger: Notifications.DailyTriggerInput = {
      hour,
      minute,
      repeats: true,
    };

    await this.scheduleLocalNotification(
      '⏰ Time for your daily check-in!',
      'Don\'t forget to complete your habits today',
      { type: 'daily_reminder' },
      trigger
    );
  }

  // Schedule habit-specific reminder
  async scheduleHabitReminder(habitId: string, habitName: string, time: Date) {
    await this.scheduleLocalNotification(
      `Reminder: ${habitName}`,
      'Tap to check in for this habit',
      { type: 'habit_reminder', habitId },
      time
    );
  }

  // Schedule payment reminder
  async schedulePaymentReminder(amount: number, dueDate: Date) {
    await this.scheduleLocalNotification(
      '💰 Payment Reminder',
      `You have $${amount} in pending payments`,
      { type: 'payment_reminder', amount },
      dueDate
    );
  }

  // Schedule group activity notification
  async sendGroupActivityNotification(groupName: string, activity: string) {
    await this.scheduleLocalNotification(
      groupName,
      activity,
      { type: 'group_activity' }
    );
  }

  // Get all scheduled notifications
  async getScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Cancel specific scheduled notification
  async cancelScheduledNotification(identifier: string) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }
}

export const pushNotificationService = PushNotificationService.getInstance();