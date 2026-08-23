import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function prepareNotifications() {
  const permissions = await Notifications.getPermissionsAsync();
  if (!permissions.granted) await Notifications.requestPermissionsAsync();
  await Notifications.setNotificationChannelAsync('yaya-default', {
    name: "Yaya'sDay reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function scheduleTaskReminder(title: string, date: Date, minutesBefore = 10) {
  const triggerDate = new Date(date.getTime() - minutesBefore * 60000);
  if (triggerDate.getTime() <= Date.now()) return null;
  return Notifications.scheduleNotificationAsync({
    content: { title: "Yaya'sDay 💜", body: `${title} starts in ${minutesBefore} minutes.` },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
  });
}

export async function cancelAllYayaNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
