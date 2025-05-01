"use client";

import { useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { RootState } from "@/redux/store";
import { fetchMeetingsThunk } from "@/redux/thunk/meetings.thunk";
import { setCurrentStatus, setSearchText } from "@/redux/slice/meetings.slice";
import { format } from "date-fns";
import { useAppSelector } from "@/hooks";
import { useAppDispatch } from "@/hooks";
import debounce from "lodash/debounce";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Meetings() {
  const dispatch = useAppDispatch();
  const { meetings, loading, currentStatus, searchText, pagination } =
    useAppSelector((state: RootState) => state.meetings);

  const debouncedFetchMeetings = useCallback(
    debounce((status: string, text: string, page: number = 1) => {
      dispatch(
        fetchMeetingsThunk({
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
      debouncedFetchMeetings(currentStatus, searchText);
    }
  }, [dispatch, currentStatus, searchText, debouncedFetchMeetings]);

  const handleStatusChange = (status: "active" | "ended") => {
    dispatch(setCurrentStatus(status));
  };

  const handleSearch = (value: string) => {
    dispatch(setSearchText(value));
  };

  const handlePageChange = (page: number) => {
    debouncedFetchMeetings(currentStatus, searchText, page);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search meetings... (min 3 characters)"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          />
        </div>

        <Tabs
          value={currentStatus}
          onValueChange={(value) =>
            handleStatusChange(value as "active" | "ended")
          }
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-2 gap-2">
            <TabsTrigger value="active" className="w-full">
              Active
            </TabsTrigger>
            <TabsTrigger value="ended" className="w-full">
              Ended
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
      ) : meetings.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          {searchText.length > 0 && searchText.length < 3
            ? "Please enter at least 3 characters to search"
            : "No meetings found"}
        </Card>
      ) : (
        <div className="grid gap-4">
          {meetings.map((meeting: any) => (
            <Card key={meeting?.id} className="p-6 bg-card border shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">{meeting?.customer?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {meeting?.customer?.email}
                  </p>
                  <p className="text-sm">
                    Scheduled for{" "}
                    {format(new Date(meeting?.booking?.scheduled_at), "PPP p")}
                  </p>
                  <p className="text-sm">
                    Duration: {meeting?.booking?.duration_minutes} minutes
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      meeting?.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {meeting?.status}
                  </span>
                  {meeting?.status === "active" && (
                    <Link href={meeting?.booking?.meeting_link}>
                      <Button
                        size="sm"
                        className="bg-primary/90 text-white hover:bg-primary/30"
                      >
                        Join Meeting
                      </Button>
                    </Link>
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
