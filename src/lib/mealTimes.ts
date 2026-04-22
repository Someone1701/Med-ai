const MEAL_TIMES: Record<string, { label: string; time: string; hour: number; minute: number; icon: string }> = {
  before_breakfast: { label: "Before Breakfast", time: "7:00 AM", hour: 7, minute: 0, icon: "🌅" },
  after_breakfast: { label: "After Breakfast", time: "9:00 AM", hour: 9, minute: 0, icon: "☀️" },
  lunch: { label: "Lunch", time: "12:00 PM", hour: 12, minute: 0, icon: "🍱" },
  dinner: { label: "Dinner", time: "8:00 PM", hour: 20, minute: 0, icon: "🌙" },
};

export default MEAL_TIMES;
