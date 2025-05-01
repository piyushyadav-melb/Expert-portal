// Helper function to convert 24h time to 12h time
export const to12HourFormat = (time24h: string) => {
  const [hours, minutes] = time24h.split(":");
  let period = "AM";
  let hours12 = parseInt(hours, 10);

  if (hours12 >= 12) {
    period = "PM";
    if (hours12 > 12) hours12 -= 12;
  }
  if (hours12 === 0) hours12 = 12;

  return `${hours12}:${minutes} ${period}`;
};

// Helper function to convert 12h time to 24h time
export const to24HourFormat = (time12h: string) => {
  const [time, period] = time12h.split(" ");
  let [hours, minutes] = time.split(":");
  let hoursNum = parseInt(hours, 10);

  if (period === "PM" && hoursNum !== 12) hoursNum += 12;
  if (period === "AM" && hoursNum === 12) hoursNum = 0;

  return `${hoursNum.toString().padStart(2, "0")}:${minutes}`;
};

export const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time24h = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      slots.push(to12HourFormat(time24h));
    }
  }
  return slots;
};

// Helper function to check if two time slots overlap
export const doSlotsOverlap = (slot1: any, slot2: any) => {
  const start1 = to24HourFormat(slot1.start);
  const end1 = to24HourFormat(slot1.end);
  const start2 = to24HourFormat(slot2.start);
  const end2 = to24HourFormat(slot2.end);
  return start1 < end2 && start2 < end1;
};

// Helper function to validate time slot
export const isValidTimeSlot = (slot: any) => {
  return slot.start && slot.end;
};
