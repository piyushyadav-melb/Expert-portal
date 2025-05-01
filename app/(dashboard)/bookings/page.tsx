"use client";

import { Bookings } from "@/components/bookings/bookings";

export default function BookingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            My Bookings
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage and view all your bookings
          </p>
        </div>

        <Bookings />
      </div>
    </div>
  );
}
