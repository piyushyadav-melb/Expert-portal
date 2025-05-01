"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getUnavailableDates,
  saveUnavailableDates,
} from "@/service/schedule.service";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import dayjs from "dayjs";
import { Loader2 } from "lucide-react";

export default function UnavailableDates() {
  const [isLoading, setIsLoading] = useState(true);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [calendarUnavailableDates, setCalendarUnavailableDates] = useState<
    string[]
  >([]);
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchUnavailableDates = async () => {
    try {
      const response = await getUnavailableDates();
      if (response.status && response.data) {
        setUnavailableDates(response.data);
        setCalendarUnavailableDates(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch unavailable dates:", error);
      toast.error("Failed to load unavailable dates");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnavailableDates();
  }, []);

  const handleCalendarSelect = (dates: Date[] | undefined) => {
    if (!dates) {
      setCalendarUnavailableDates([]);
      return;
    }

    const formattedDates = dates.map((date) =>
      dayjs(date).format("YYYY-MM-DD")
    );

    setCalendarUnavailableDates(formattedDates);
  };

  const handleSaveUnavailableDates = async () => {
    try {
      // Only send the dates that are actually selected
      const response = await saveUnavailableDates(calendarUnavailableDates);
      if (response.status) {
        setUnavailableDates(calendarUnavailableDates);
        toast.success("Unavailable dates saved successfully");
        setIsEditMode(false);
      }
    } catch (error) {
      console.error("Failed to save unavailable dates:", error);
      toast.error("Failed to save unavailable dates");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold">Unavailable Dates</CardTitle>
        <Dialog open={isEditMode} onOpenChange={setIsEditMode}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={() => setIsEditMode(true)}>
              Set Dates
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] lg:max-w-fit">
            <DialogHeader>
              <DialogTitle>Edit Unavailable Dates</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <Calendar
                mode="multiple"
                selected={calendarUnavailableDates.map((d) => new Date(d))}
                onSelect={handleCalendarSelect}
                disabled={(date) => date < new Date()}
                className={cn(
                  "rounded-md border dark:border-gray-800",
                  "mx-auto w-full max-w-[350px]"
                )}
              />
            </div>
            <DialogFooter className="mt-4">
              <Button onClick={handleSaveUnavailableDates} className="w-full">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {unavailableDates.length > 0 ? (
          <div className="space-y-2">
            {unavailableDates.map((date) => (
              <div
                key={date}
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border dark:border-gray-800"
              >
                <span className="text-foreground">
                  {dayjs(date).format("MMMM D, YYYY")}
                </span>
                <span className="text-muted-foreground text-sm">
                  {dayjs(date).format("dddd")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No unavailable dates set
          </p>
        )}
      </CardContent>
    </Card>
  );
}
