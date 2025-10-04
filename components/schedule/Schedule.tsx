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
import { Clock, Loader2, Plus, X, Copy, Check } from "lucide-react";
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
    let endTotalMinutes = endHour * 60 + endMinute;

    // Special case: allow crossing midnight for 11:00 PM / 11:30 PM to 12:00 AM
    if (endTotalMinutes === 0 && startTotalMinutes >= 23 * 60) {
      endTotalMinutes = 24 * 60; // treat 12:00 AM as 24:00 for duration calc
    }

    const duration = endTotalMinutes - startTotalMinutes;
    return duration > 0 && duration >= 30 && duration <= 60;
  });
};

const isAllowedStartTime = (time: string) => {
  const start24Hour = to24HourFormat(time);
  const [h, m] = start24Hour.split(":").map(Number);
  const total = h * 60 + m;
  const min = 7 * 60;        // 7:00 AM
  const max = 23 * 60 + 30;  // 11:30 PM
  return total >= min && total <= max;
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
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [sourceDay, setSourceDay] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);

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
        // if (
        //   to24HourFormat(updatedSlot.start) >= to24HourFormat(updatedSlot.end)
        // ) {
        //   toast.error("End time must be after start time");
        //   return prev;
        // }

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

  const handleCopySchedule = () => {
    if (!sourceDay) {
      toast.error("Please select a source day");
      return;
    }

    if (selectedDays.length === 0) {
      toast.error("Please select at least one target day");
      return;
    }

    if (!schedule[sourceDay].isAvailable || schedule[sourceDay].slots.length === 0) {
      toast.error("Source day must have available time slots");
      return;
    }

    setSchedule((prev: any) => {
      const newSchedule = { ...prev };
      const sourceSlots = [...prev[sourceDay].slots];

      selectedDays.forEach((day) => {
        newSchedule[day] = {
          isAvailable: true,
          slots: sourceSlots.map(slot => ({ ...slot }))
        };
      });

      return newSchedule;
    });

    setCopySuccess(true);
    toast.success(`Schedule copied from ${sourceDay} to ${selectedDays.join(", ")}`);

    // Reset form
    setTimeout(() => {
      setShowCopyModal(false);
      setSourceDay("");
      setSelectedDays([]);
      setCopySuccess(false);
    }, 1500);
  };

  const handleDaySelection = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const getAvailableDays = () => {
    return daysOfWeek.filter(day =>
      schedule[day].isAvailable && schedule[day].slots.length > 0
    );
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
      <Button
        onClick={() => setShowCopyModal(true)}
        variant="outline"
        className="flex items-center gap-2 mb-4"
        disabled={getAvailableDays().length === 0}
      >
        <Copy className="h-4 w-4" />
        Copy Schedule
      </Button>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3">
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
                    <div className="flex items-center justify-center space-x-3">
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
                                  {timeSlots
                                    .filter(isAllowedStartTime)
                                    .map((time) => (
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
                                      <SelectItem key={time} value={time}>
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

      <div className="mt-8 flex justify-between items-center">
        {/* <Button
          onClick={() => setShowCopyModal(true)}
          variant="outline"
          className="flex items-center gap-2"
          disabled={getAvailableDays().length === 0}
        >
          <Copy className="h-4 w-4" />
          Copy Schedule
        </Button> */}

        <Button
          onClick={handleSave}
          disabled={updateLoading || isLoading}
          className="bg-primary hover:bg-primary/90"
        >
          {updateLoading ? "Saving..." : "Save Schedule"}
        </Button>
      </div>

      {/* Copy Schedule Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Copy Schedule</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCopyModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {copySuccess ? (
              <div className="text-center py-8">
                <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-green-600 font-medium">Schedule copied successfully!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Source Day Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Copy from which day?
                  </label>
                  <Select value={sourceDay} onValueChange={setSourceDay}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source day" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableDays().map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Target Days Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Copy to which days?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`copy-${day}`}
                          checked={selectedDays.includes(day)}
                          onCheckedChange={() => handleDaySelection(day)}
                          disabled={day === sourceDay}
                        />
                        <label
                          htmlFor={`copy-${day}`}
                          className={`text-sm ${day === sourceDay ? 'text-gray-400' : 'cursor-pointer'
                            }`}
                        >
                          {day}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCopyModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCopySchedule}
                    disabled={!sourceDay || selectedDays.length === 0}
                  >
                    Copy Schedule
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
