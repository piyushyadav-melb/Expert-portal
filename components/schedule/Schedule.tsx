"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSchedule, saveSchedule } from "@/service/schedule.service";
import { Clock, Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  doSlotsOverlap,
  generateTimeSlots,
  isValidTimeSlot,
  to12HourFormat,
  to24HourFormat,
} from "@/utils/helper";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const timeSlots = generateTimeSlots();

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const slotVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const getValidEndTimes = (startTime: string) => {
  if (!startTime) return [];

  // Convert 12-hour format to 24-hour for calculations
  const start24Hour = to24HourFormat(startTime);
  const [startHour, startMinute] = start24Hour.split(":").map(Number);
  const startTotalMinutes = startHour * 60 + startMinute;

  return timeSlots.filter((time) => {
    const end24Hour = to24HourFormat(time);
    const [endHour, endMinute] = end24Hour.split(":").map(Number);
    const endTotalMinutes = endHour * 60 + endMinute;

    const duration = endTotalMinutes - startTotalMinutes;
    return duration >= 30 && duration <= 60;
  });
};

export default function Schedule() {
  const router = useRouter();
  const [schedule, setSchedule] = useState<any>(
    daysOfWeek.reduce(
      (acc, day) => ({ ...acc, [day]: { isAvailable: false, slots: [] } }),
      {}
    )
  );
  const [isLoading, setIsLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await getSchedule();
        if (response.status && response.data) {
          const existingSchedule = JSON.parse(response.data);
          const converted = Object.entries(existingSchedule).reduce(
            (acc: any, [day, daySchedule]: [string, any]) => {
              acc[day] = {
                ...daySchedule,
                slots: daySchedule.slots.map((slot: any) => ({
                  start: to12HourFormat(slot.start),
                  end: to12HourFormat(slot.end),
                })),
              };
              return acc;
            },
            {}
          );
          setSchedule(converted);
        }
      } catch (error) {
        console.error("Failed to fetch schedule:", error);
        toast.error("Failed to load existing schedule");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const handleDayToggle = (day: string) => {
    setSchedule((prev: any) => ({
      ...prev,
      [day]: {
        isAvailable: !prev[day].isAvailable,
        slots: prev[day].isAvailable ? [] : [{ start: "", end: "" }],
      },
    }));
  };

  const handleAddTimeSlot = (day: string) => {
    setSchedule((prev: any) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { start: "", end: "" }],
      },
    }));
  };

  const handleTimeChange = (
    day: string,
    index: number,
    type: string,
    value: string
  ) => {
    setSchedule((prev: any) => {
      const updatedSlots = [...prev[day].slots];
      let updatedSlot = { ...updatedSlots[index], [type]: value };

      if (updatedSlot.start && updatedSlot.end) {
        if (
          to24HourFormat(updatedSlot.start) >= to24HourFormat(updatedSlot.end)
        ) {
          toast.error("End time must be after start time");
          return prev;
        }

        const hasOverlap = updatedSlots.some(
          (slot, i) => i !== index && doSlotsOverlap(updatedSlot, slot)
        );

        if (hasOverlap) {
          toast.error("This time overlaps with another slot");
          return prev;
        }
      }

      updatedSlots[index] = updatedSlot;
      return {
        ...prev,
        [day]: {
          ...prev[day],
          slots: updatedSlots,
        },
      };
    });
  };

  const handleRemoveTimeSlot = (day: string, index: number) => {
    setSchedule((prev: any) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_: any, i: any) => i !== index),
      },
    }));
  };

  const handleSave = async () => {
    const invalidSlots = Object.entries(schedule).reduce(
      (acc: any[], [day, daySchedule]: [string, any]) => {
        if (daySchedule.isAvailable) {
          daySchedule.slots.forEach((slot: any, index: number) => {
            if (!isValidTimeSlot(slot)) {
              acc.push({ day, index: index + 1 });
            }
          });
        }
        return acc;
      },
      []
    );

    if (invalidSlots.length > 0) {
      invalidSlots.forEach(({ day, index }) => {
        toast.error(
          `Please select both start and end times for slot ${index} on ${day}`
        );
      });
      return;
    }

    try {
      setUpdateLoading(true);
      const scheduleToSave = Object.entries(schedule).reduce(
        (acc: any, [day, daySchedule]: [string, any]) => {
          acc[day] = {
            ...daySchedule,
            slots: daySchedule.slots.map((slot: any) => ({
              start: to24HourFormat(slot.start),
              end: to24HourFormat(slot.end),
            })),
          };
          return acc;
        },
        {}
      );

      await saveSchedule({ schedule: JSON.stringify(scheduleToSave) });
      toast.success("Schedule saved successfully!");
    } catch (error) {
      console.error("Failed to save schedule:", error);
      toast.error("Failed to save schedule");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto p-6 max-w-7xl"
    >
      <h1 className="text-3xl font-bold mb-6 text-center">
        Set Your Availability
      </h1>
      <p className="text-center mb-6">
        Define your weekly schedule by selecting available days and time slots.
        Overlapping time slots are not allowed.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {daysOfWeek.map((day, index) => (
            <motion.div
              key={day}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="h-fit"
            >
              <Card className="h-full">
                <CardHeader className="py-3 px-4">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={`${day}-toggle`}
                        checked={schedule[day].isAvailable}
                        onCheckedChange={() => handleDayToggle(day)}
                        className="h-4 w-4"
                      />
                      <label
                        htmlFor={`${day}-toggle`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {day}
                      </label>
                    </div>
                    {schedule[day].isAvailable && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddTimeSlot(day)}
                        className="flex items-center text-xs h-8"
                      >
                        <Plus className="mr-1 h-3 w-3" /> Add Slot
                      </Button>
                    )}
                  </div>
                </CardHeader>
                {schedule[day].isAvailable && (
                  <CardContent className="px-4 pb-4">
                    <AnimatePresence>
                      {schedule[day].slots.map((slot: any, index: number) => (
                        <motion.div
                          key={index}
                          variants={slotVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          transition={{ duration: 0.2 }}
                          className="mb-3 last:mb-0"
                        >
                          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4 text-gray-500" />
                              <span className="text-xs text-gray-600">Slot {index + 1}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveTimeSlot(day, index)}
                                className="ml-auto h-6 w-6"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <Select
                                value={slot.start}
                                onValueChange={(value) =>
                                  handleTimeChange(day, index, "start", value)
                                }
                              >
                                <SelectTrigger className="w-full h-8 text-xs">
                                  <SelectValue placeholder="Start Time" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                  {timeSlots.map((time) => (
                                    <SelectItem
                                      key={time}
                                      value={time}
                                      disabled={schedule[day].slots.some(
                                        (s: any, i: number) =>
                                          i !== index &&
                                          to24HourFormat(time) >=
                                          to24HourFormat(s.start) &&
                                          to24HourFormat(time) < to24HourFormat(s.end)
                                      )}
                                    >
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="text-center text-xs text-gray-500">to</div>
                              <Select
                                value={slot.end}
                                onValueChange={(value) =>
                                  handleTimeChange(day, index, "end", value)
                                }
                              >
                                <SelectTrigger className="w-full h-8 text-xs">
                                  <SelectValue placeholder="End Time" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                  {slot.start ? (
                                    getValidEndTimes(slot.start).map((time) => (
                                      <SelectItem
                                        key={time}
                                        value={time}
                                        disabled={
                                          to24HourFormat(time) <=
                                          to24HourFormat(slot.start) ||
                                          schedule[day].slots.some(
                                            (s: any, i: number) =>
                                              i !== index &&
                                              to24HourFormat(time) >
                                              to24HourFormat(s.start) &&
                                              to24HourFormat(time) <=
                                              to24HourFormat(s.end)
                                          )
                                        }
                                      >
                                        {time}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="" disabled>
                                      Select start time first
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateLoading || isLoading}
          className="bg-primary hover:bg-primary/90"
        >
          {updateLoading ? "Saving..." : "Save Schedule"}
        </Button>
      </div>
    </motion.div>
  );
}
