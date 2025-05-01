"use client";

import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { RootState } from "@/redux/store";
import { fetchBookingsThunk } from "@/redux/thunk/bookings.thunk";
import { setCurrentStatus, setSearchText } from "@/redux/slice/bookings.slice";
import { format } from "date-fns";
import { useAppSelector } from "@/hooks";
import { useAppDispatch } from "@/hooks";
import debounce from "lodash/debounce";
import { Button } from "@/components/ui/button";
import { createMeetingThunk } from "@/redux/thunk/meetings.thunk";
import { toast } from "sonner";
import { createMeeting } from "@/service/meetings.service";

export function Bookings() {
  const dispatch = useAppDispatch();
  const { bookings, loading, currentStatus, searchText, pagination } =
    useAppSelector((state: RootState) => state.bookings);

  const debouncedFetchBookings = useCallback(
    debounce((status: string, text: string, page: number = 1) => {
      dispatch(
        fetchBookingsThunk({
          status,
          searchText: text,
          page,
        })
      );
    }, 200),
    [dispatch]
  );

  useEffect(() => {
    if (searchText.length >= 3 || searchText.length === 0) {
      debouncedFetchBookings(currentStatus, searchText);
    }
  }, [dispatch, currentStatus, searchText, debouncedFetchBookings]);

  const handleStatusChange = (
    status: "UPCOMING" | "COMPLETED" | "CANCELLED"
  ) => {
    dispatch(setCurrentStatus(status));
  };

  const handleSearch = (value: string) => {
    dispatch(setSearchText(value));
  };

  const handlePageChange = (page: number) => {
    debouncedFetchBookings(currentStatus, searchText, page);
  };

  const handleCreateMeeting = async (bookingId: string) => {
    try {
      const response = await dispatch(createMeetingThunk(bookingId)).unwrap();

      if (response.status == true) {
        toast.success("Meeting created successfully");
        // Fetch bookings again to update the list
        debouncedFetchBookings(
          currentStatus,
          searchText,
          pagination.currentPage
        );
      } else {
        toast.error(response.message || "Failed to create meeting");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create meeting");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search bookings... (min 3 characters)"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          />
        </div>

        <Tabs
          value={currentStatus}
          onValueChange={(value) =>
            handleStatusChange(value as "UPCOMING" | "COMPLETED" | "CANCELLED")
          }
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-3 gap-2">
            <TabsTrigger value="UPCOMING" className="w-full">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="COMPLETED" className="w-full">
              Completed
            </TabsTrigger>
            <TabsTrigger value="CANCELLED" className="w-full">
              Cancelled
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {pagination?.lastPage > 1 && (
          <div className="flex items-center justify-center gap-1 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination?.currentPage - 1)}
              disabled={!pagination.prev}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from(
                { length: pagination?.lastPage || 0 },
                (_, i) => i + 1
              ).map((page) => (
                <Button
                  key={page}
                  variant={page === pagination.currentPage ? "soft" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.next}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : bookings.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          {searchText.length > 0 && searchText.length < 3
            ? "Please enter at least 3 characters to search"
            : "No bookings found"}
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking: any) => (
            <Card key={booking.id} className="p-6 bg-card border shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">{booking.customer.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {booking.customer.email}
                  </p>
                  <p className="text-sm">
                    Scheduled for{" "}
                    {format(new Date(booking.scheduled_at), "PPP p")}
                  </p>
                  <p className="text-sm">
                    Duration: {booking.duration_minutes} minutes
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">
                      Status
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        booking.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : booking.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  {booking.status === "PENDING" && (
                    <Button
                      onClick={() => handleCreateMeeting(booking.id)}
                      size="sm"
                      variant="soft"
                      className="bg-primary/90 text-white hover:bg-primary/30"
                    >
                      Create Meeting
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
