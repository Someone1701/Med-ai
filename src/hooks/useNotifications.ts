import { useEffect, useRef, useCallback } from "react";
import MEAL_TIMES from "@/lib/mealTimes";

type MedicineSchedule = {
  medicineName: string;
  mealSlot: string;
};

export function useNotifications(schedules: MedicineSchedule[], enabled: boolean) {
  const timersRef = useRef<number[]>([]);
  const permissionRef = useRef<NotificationPermission>("default");

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") {
      permissionRef.current = "granted";
      return true;
    }
    const result = await Notification.requestPermission();
    permissionRef.current = result;
    return result === "granted";
  }, []);

  useEffect(() => {
    if (!enabled || schedules.length === 0) return;

    const setupTimers = async () => {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      // Clear old timers
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];

      const now = new Date();

      schedules.forEach(({ medicineName, mealSlot }) => {
        const slotInfo = MEAL_TIMES[mealSlot];
        if (!slotInfo) return;

        const target = new Date();
        target.setHours(slotInfo.hour, slotInfo.minute, 0, 0);

        // If time already passed today, schedule for tomorrow
        if (target <= now) {
          target.setDate(target.getDate() + 1);
        }

        const delay = target.getTime() - now.getTime();

        const timer = window.setTimeout(() => {
          new Notification(`💊 Medicine Reminder - ${slotInfo.label}`, {
            body: `Time to take ${medicineName} (${slotInfo.time})`,
            icon: "🤖",
            tag: `${medicineName}-${mealSlot}`,
          });
        }, delay);

        timersRef.current.push(timer);
      });
    };

    setupTimers();

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [schedules, enabled, requestPermission]);

  return { requestPermission, permission: permissionRef.current };
}
